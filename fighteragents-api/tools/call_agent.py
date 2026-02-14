import asyncio
from functools import wraps

import click

from fighteragents.application.conversation_service.generate_response import (
    get_streaming_response,
)
from fighteragents.domain.ufcfighter_factory import UFCFighterFactory


def async_command(f):
    """Decorator to run an async click command."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return wrapper


@click.command()
@click.option(
    "--ufcfighter-id",
    type=str,
    required=True,
    help="ID of the ufcfighter to call.",
)
@click.option(
    "--query",
    type=str,
    required=True,
    help="Query to call the agent with.",
)
@async_command
async def main(ufcfighter_id: str, query: str) -> None:
    """CLI command to query a ufcfighter.

    Args:
        ufcfighter_id: ID of the ufcfighter to call.
        query: Query to call the agent with.
    """

    ufcfighter_factory = UFCFighterFactory()
    ufcfighter = ufcfighter_factory.get_ufcfighter(ufcfighter_id)

    print(
        f"\033[32mCalling agent with ufcfighter_id: `{ufcfighter_id}` and query: `{query}`\033[0m"
    )
    print("\033[32mResponse:\033[0m")
    print("\033[32m--------------------------------\033[0m")
    async for chunk in get_streaming_response(
        messages=query,
        ufcfighter_id=ufcfighter_id,
        ufcfighter_name=ufcfighter.name,
        ufcfighter_perspective=ufcfighter.perspective,
        ufcfighter_style=ufcfighter.style,
        ufcfighter_context="",
    ):
        print(f"\033[32m{chunk}\033[0m", end="", flush=True)
    print("\033[32m--------------------------------\033[0m")


if __name__ == "__main__":
    main()
