import json
from pathlib import Path
from typing import List

from pydantic import BaseModel, Field


class UFCFighterExtract(BaseModel):
    """A class representing raw ufcfighter data extracted from external sources.

    This class follows the structure of the ufcfighters.json file and contains
    basic information about ufcfighters before enrichment.

    Args:
        id (str): Unique identifier for the ufcfighter.
        urls (List[str]): List of URLs with information about the ufcfighter.
    """

    id: str = Field(description="Unique identifier for the ufcfighter")
    urls: List[str] = Field(
        description="List of URLs with information about the ufcfighter"
    )

    @classmethod
    def from_json(cls, metadata_file: Path) -> list["UFCFighterExtract"]:
        with open(metadata_file, "r") as f:
            ufcfighters_data = json.load(f)

        return [cls(**ufcfighter) for ufcfighter in ufcfighters_data]


class UFCFighter(BaseModel):
    """A class representing a ufcfighter agent with memory capabilities.

    Args:
        id (str): Unique identifier for the ufcfighter.
        name (str): Name of the ufcfighter.
        perspective (str): Description of the ufcfighter's theoretical views
            about AI.
        style (str): Description of the ufcfighter's talking style.
    """

    id: str = Field(description="Unique identifier for the ufcfighter")
    name: str = Field(description="Name of the ufcfighter")
    perspective: str = Field(
        description="Description of the ufcfighter's theoretical views about AI"
    )
    style: str = Field(description="Description of the ufcfighter's talking style")

    def __str__(self) -> str:
        return f"UFCFighter(id={self.id}, name={self.name}, perspective={self.perspective}, style={self.style})"
