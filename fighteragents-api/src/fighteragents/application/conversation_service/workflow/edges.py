from typing_extensions import Literal

from langgraph.graph import END

from fighteragents.application.conversation_service.workflow.state import UFCFighterState
from fighteragents.config import settings


def should_summarize_conversation(
    state: UFCFighterState,
) -> Literal["summarize_conversation_node", "__end__"]:
    messages = state["messages"]

    if len(messages) > settings.TOTAL_MESSAGES_SUMMARY_TRIGGER:
        return "summarize_conversation_node"

    return END
