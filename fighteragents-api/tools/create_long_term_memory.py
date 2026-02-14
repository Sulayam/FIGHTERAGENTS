from pathlib import Path

import click

from fighteragents.application import LongTermMemoryCreator
from fighteragents.config import settings
from fighteragents.domain.ufcfighter import UFCFighterExtract


@click.command()
@click.option(
    "--metadata-file",
    type=click.Path(exists=True, path_type=Path),
    default=settings.EXTRACTION_METADATA_FILE_PATH,
    help="Path to the ufcfighters extraction metadata JSON file.",
)
def main(metadata_file: Path) -> None:
    """CLI command to create long-term memory for ufcfighters.

    Args:
        metadata_file: Path to the ufcfighters extraction metadata JSON file.
    """
    ufcfighters = UFCFighterExtract.from_json(metadata_file)

    long_term_memory_creator = LongTermMemoryCreator.build_from_settings()
    long_term_memory_creator(ufcfighters)


if __name__ == "__main__":
    main()
