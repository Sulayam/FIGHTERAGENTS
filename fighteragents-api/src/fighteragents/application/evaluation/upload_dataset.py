import json
from pathlib import Path

import opik

from fighteragents.infrastructure import opik_utils


def upload_dataset(name: str, data_path: Path) -> opik.Dataset:
    assert data_path.exists(), f"File {data_path} does not exist."

    with open(data_path, "r") as f:
        evaluation_data = json.load(f)

    dataset_items = []
    for sample in evaluation_data["samples"]:
        dataset_items.append(
            {
                "ufcfighter_id": sample["ufcfighter_id"],
                "messages": sample["messages"],
            }
        )

    dataset = opik_utils.create_dataset(
        name=name,
        description="Dataset containing question-answer pairs for multiple ufcfighters.",
        items=dataset_items,
    )

    return dataset
