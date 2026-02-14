from pathlib import Path

import click
from loguru import logger

from fighteragents.application.evaluation import EvaluationDatasetGenerator
from fighteragents.config import settings
from fighteragents.domain.ufcfighter import UFCFighterExtract


@click.command()
@click.option(
    "--metadata-file",
    type=click.Path(exists=True, path_type=Path),
    default=settings.EXTRACTION_METADATA_FILE_PATH,
    help="Path to the metadata file containing ufcfighter extracts",
)
@click.option(
    "--temperature",
    type=float,
    default=0.9,
    help="Temperature parameter for generation",
)
@click.option(
    "--max-samples",
    type=int,
    default=40,
    help="Maximum number of samples to generate",
)
def main(metadata_file: Path, temperature: float, max_samples: int) -> None:
    """
    Generate an evaluation dataset from ufcfighter extracts.

    Args:
        metadata_file: Path to the metadata file containing ufcfighter extracts
        temperature: Temperature parameter for generation
        max_samples: Maximum number of samples to generate
    """
    ufcfighters = UFCFighterExtract.from_json(metadata_file)

    logger.info(
        f"Generating evaluation dataset with temperature {temperature} and {max_samples} samples."
    )
    logger.info(f"Total ufcfighters: {len(ufcfighters)}")

    evaluation_dataset_generator = EvaluationDatasetGenerator(
        temperature=temperature, max_samples=max_samples
    )
    evaluation_dataset_generator(ufcfighters)


if __name__ == "__main__":
    main()
