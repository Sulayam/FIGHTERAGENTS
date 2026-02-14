import uuid
from typing import Any, AsyncGenerator, Union

from langchain_core.messages import AIMessage, AIMessageChunk, HumanMessage
from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver
from opik.integrations.langchain import OpikTracer

from fighteragents.application.conversation_service.workflow.graph import (
    create_workflow_graph,
)
from fighteragents.application.conversation_service.workflow.state import UFCFighterState
from fighteragents.config import settings


async def get_response(
    messages: str | list[str] | list[dict[str, Any]],
    ufcfighter_id: str,
    ufcfighter_name: str,
    ufcfighter_perspective: str,
    ufcfighter_style: str,
    ufcfighter_context: str,
    new_thread: bool = False,
) -> tuple[str, UFCFighterState]:
    """Run a conversation through the workflow graph.

    Args:
        message: Initial message to start the conversation.
        ufcfighter_id: Unique identifier for the ufcfighter.
        ufcfighter_name: Name of the ufcfighter.
        ufcfighter_perspective: UFCFighter's perspective on the topic.
        ufcfighter_style: Style of conversation (e.g., "Socratic").
        ufcfighter_context: Additional context about the ufcfighter.

    Returns:
        tuple[str, UFCFighterState]: A tuple containing:
            - The content of the last message in the conversation.
            - The final state after running the workflow.

    Raises:
        RuntimeError: If there's an error running the conversation workflow.
    """

    graph_builder = create_workflow_graph()

    try:
        async with AsyncMongoDBSaver.from_conn_string(
            conn_string=settings.MONGO_URI,
            db_name=settings.MONGO_DB_NAME,
            checkpoint_collection_name=settings.MONGO_STATE_CHECKPOINT_COLLECTION,
            writes_collection_name=settings.MONGO_STATE_WRITES_COLLECTION,
        ) as checkpointer:
            graph = graph_builder.compile(checkpointer=checkpointer)
            opik_tracer = OpikTracer(graph=graph.get_graph(xray=True))

            thread_id = (
                ufcfighter_id if not new_thread else f"{ufcfighter_id}-{uuid.uuid4()}"
            )
            config = {
                "configurable": {"thread_id": thread_id},
                "callbacks": [opik_tracer],
            }
            output_state = await graph.ainvoke(
                input={
                    "messages": __format_messages(messages=messages),
                    "ufcfighter_name": ufcfighter_name,
                    "ufcfighter_perspective": ufcfighter_perspective,
                    "ufcfighter_style": ufcfighter_style,
                    "ufcfighter_context": ufcfighter_context,
                },
                config=config,
            )
        last_message = output_state["messages"][-1]
        return last_message.content, UFCFighterState(**output_state)
    except Exception as e:
        raise RuntimeError(f"Error running conversation workflow: {str(e)}") from e


async def get_streaming_response(
    messages: str | list[str] | list[dict[str, Any]],
    ufcfighter_id: str,
    ufcfighter_name: str,
    ufcfighter_perspective: str,
    ufcfighter_style: str,
    ufcfighter_context: str,
    new_thread: bool = False,
) -> AsyncGenerator[str, None]:
    """Run a conversation through the workflow graph with streaming response.

    Args:
        messages: Initial message to start the conversation.
        ufcfighter_id: Unique identifier for the ufcfighter.
        ufcfighter_name: Name of the ufcfighter.
        ufcfighter_perspective: UFCFighter's perspective on the topic.
        ufcfighter_style: Style of conversation (e.g., "Socratic").
        ufcfighter_context: Additional context about the ufcfighter.
        new_thread: Whether to create a new conversation thread.

    Yields:
        Chunks of the response as they become available.

    Raises:
        RuntimeError: If there's an error running the conversation workflow.
    """
    graph_builder = create_workflow_graph()

    try:
        async with AsyncMongoDBSaver.from_conn_string(
            conn_string=settings.MONGO_URI,
            db_name=settings.MONGO_DB_NAME,
            checkpoint_collection_name=settings.MONGO_STATE_CHECKPOINT_COLLECTION,
            writes_collection_name=settings.MONGO_STATE_WRITES_COLLECTION,
        ) as checkpointer:
            graph = graph_builder.compile(checkpointer=checkpointer)
            opik_tracer = OpikTracer(graph=graph.get_graph(xray=True))

            thread_id = (
                ufcfighter_id if not new_thread else f"{ufcfighter_id}-{uuid.uuid4()}"
            )
            config = {
                "configurable": {"thread_id": thread_id},
                "callbacks": [opik_tracer],
            }

            async for chunk in graph.astream(
                input={
                    "messages": __format_messages(messages=messages),
                    "ufcfighter_name": ufcfighter_name,
                    "ufcfighter_perspective": ufcfighter_perspective,
                    "ufcfighter_style": ufcfighter_style,
                    "ufcfighter_context": ufcfighter_context,
                },
                config=config,
                stream_mode="messages",
            ):
                if chunk[1]["langgraph_node"] == "conversation_node" and isinstance(
                    chunk[0], AIMessageChunk
                ):
                    yield chunk[0].content

    except Exception as e:
        raise RuntimeError(
            f"Error running streaming conversation workflow: {str(e)}"
        ) from e


def __format_messages(
    messages: Union[str, list[dict[str, Any]]],
) -> list[Union[HumanMessage, AIMessage]]:
    """Convert various message formats to a list of LangChain message objects.

    Args:
        messages: Can be one of:
            - A single string message
            - A list of string messages
            - A list of dictionaries with 'role' and 'content' keys

    Returns:
        List[Union[HumanMessage, AIMessage]]: A list of LangChain message objects
    """

    if isinstance(messages, str):
        return [HumanMessage(content=messages)]

    if isinstance(messages, list):
        if not messages:
            return []

        if (
            isinstance(messages[0], dict)
            and "role" in messages[0]
            and "content" in messages[0]
        ):
            result = []
            for msg in messages:
                if msg["role"] == "user":
                    result.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    result.append(AIMessage(content=msg["content"]))
            return result

        return [HumanMessage(content=message) for message in messages]

    return []
