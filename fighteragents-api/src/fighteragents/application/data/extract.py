from typing import Generator

from langchain_community.document_loaders import WebBaseLoader, WikipediaLoader
from langchain_core.documents import Document
from tqdm import tqdm

from fighteragents.domain.ufcfighter import UFCFighter, UFCFighterExtract
from fighteragents.domain.ufcfighter_factory import UFCFighterFactory


def get_extraction_generator(
    ufcfighters: list[UFCFighterExtract],
) -> Generator[tuple[UFCFighter, list[Document]], None, None]:
    """Extract documents for a list of ufcfighters, yielding one at a time.

    Args:
        ufcfighters: A list of UFCFighterExtract objects containing ufcfighter information.

    Yields:
        tuple[UFCFighter, list[Document]]: A tuple containing the ufcfighter object and a list of
            documents extracted for that ufcfighter.
    """

    progress_bar = tqdm(
        ufcfighters,
        desc="Extracting docs",
        unit="ufcfighter",
        bar_format="{desc}: {percentage:3.0f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}] {postfix}",
        ncols=100,
        position=0,
        leave=True,
    )

    ufcfighters_factory = UFCFighterFactory()
    for ufcfighter_extract in progress_bar:
        ufcfighter = ufcfighters_factory.get_ufcfighter(ufcfighter_extract.id)
        progress_bar.set_postfix_str(f"UFCFighter: {ufcfighter.name}")

        ufcfighter_docs = extract(ufcfighter, ufcfighter_extract.urls)

        yield (ufcfighter, ufcfighter_docs)


def extract(ufcfighter: UFCFighter, extract_urls: list[str]) -> list[Document]:
    """Extract documents for a single ufcfighter from all sources and deduplicate them.

    Args:
        ufcfighter: UFCFighter object containing ufcfighter information.
        extract_urls: List of URLs to extract content from.

    Returns:
        list[Document]: List of deduplicated documents extracted for the ufcfighter.
    """

    docs = []

    docs.extend(extract_wikipedia(ufcfighter))
    # docs.extend(extract_stanford_encyclopedia_of_philosophy(ufcfighter, extract_urls))

    return docs


def extract_wikipedia(ufcfighter: UFCFighter) -> list[Document]:
    """Extract documents for a single ufcfighter from Wikipedia.

    Args:
        ufcfighter: UFCFighter object containing ufcfighter information.

    Returns:
        list[Document]: List of documents extracted from Wikipedia for the ufcfighter.
    """

    loader = WikipediaLoader(
        query=ufcfighter.name,
        lang="en",
        load_max_docs=1,
        doc_content_chars_max=1000000,
    )
    docs = loader.load()

    for doc in docs:
        doc.metadata["ufcfighter_id"] = ufcfighter.id
        doc.metadata["ufcfighter_name"] = ufcfighter.name

    return docs


def extract_stanford_encyclopedia_of_philosophy(
    ufcfighter: UFCFighter, urls: list[str]
) -> list[Document]:
    """Extract documents for a single ufcfighter from Stanford Encyclopedia of Philosophy.

    Args:
        ufcfighter: UFCFighter object containing ufcfighter information.
        urls: List of URLs to extract content from.

    Returns:
        list[Document]: List of documents extracted from Stanford Encyclopedia for the ufcfighter.
    """

    def extract_paragraphs_and_headers(soup) -> str:
        # List of class/id names specific to the Stanford Encyclopedia of Philosophy that we want to exclude.
        excluded_sections = [
            "bibliography",
            "academic-tools",
            "other-internet-resources",
            "related-entries",
            "acknowledgments",
            "article-copyright",
            "article-banner",
            "footer",
        ]

        # Find and remove elements within excluded sections
        for section_name in excluded_sections:
            for section in soup.find_all(id=section_name):
                section.decompose()

            for section in soup.find_all(class_=section_name):
                section.decompose()

            for section in soup.find_all(
                lambda tag: tag.has_attr("id") and section_name in tag["id"].lower()
            ):
                section.decompose()

            for section in soup.find_all(
                lambda tag: tag.has_attr("class")
                and any(section_name in cls.lower() for cls in tag["class"])
            ):
                section.decompose()

        # Extract remaining paragraphs and headers
        content = []
        for element in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6"]):
            content.append(element.get_text())

        return "\n\n".join(content)

    if len(urls) == 0:
        return []

    loader = WebBaseLoader(show_progress=False)
    soups = loader.scrape_all(urls)

    documents = []
    for url, soup in zip(urls, soups):
        text = extract_paragraphs_and_headers(soup)
        metadata = {
            "source": url,
            "ufcfighter_id": ufcfighter.id,
            "ufcfighter_name": ufcfighter.name,
        }

        if title := soup.find("title"):
            metadata["title"] = title.get_text().strip(" \n")

        documents.append(Document(page_content=text, metadata=metadata))

    return documents


if __name__ == "__main__":
    conor = UFCFighterFactory().get_ufcfighter("conor")
    # docs = extract_stanford_encyclopedia_of_philosophy(
    #     aristotle,
    #     [
    #         "https://plato.stanford.edu/entries/aristotle/",
    #         "https://plato.stanford.edu/entries/aristotle/",
    #     ],
    # )
    # print(docs)
