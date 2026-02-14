from langchain_core.messages import RemoveMessage
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import ToolNode

from fighteragents.application.conversation_service.workflow.chains import (
    get_context_summary_chain,
    get_conversation_summary_chain,
    get_ufcfighter_response_chain,
)
from fighteragents.application.conversation_service.workflow.state import UFCFighterState
from fighteragents.application.conversation_service.workflow.tools import tools
from fighteragents.config import settings

retriever_node = ToolNode(tools)


async def conversation_node(state: UFCFighterState, config: RunnableConfig):
    summary = state.get("summary", "")
    conversation_chain = get_ufcfighter_response_chain()

    response = await conversation_chain.ainvoke(
        {
            "messages": state["messages"],
            "ufcfighter_context": state["ufcfighter_context"],
            "ufcfighter_name": state["ufcfighter_name"],
            "ufcfighter_perspective": state["ufcfighter_perspective"],
            "ufcfighter_style": state["ufcfighter_style"],
            "summary": summary,
        },
        config,
    )

    return {"messages": response}


async def summarize_conversation_node(state: UFCFighterState):
    summary = state.get("summary", "")
    summary_chain = get_conversation_summary_chain(summary)

    response = await summary_chain.ainvoke(
        {
            "messages": state["messages"],
            "ufcfighter_name": state["ufcfighter_name"],
            "summary": summary,
        }
    )

    delete_messages = [
        RemoveMessage(id=m.id)
        for m in state["messages"][: -settings.TOTAL_MESSAGES_AFTER_SUMMARY]
    ]
    return {"summary": response.content, "messages": delete_messages}


async def summarize_context_node(state: UFCFighterState):
    context_summary_chain = get_context_summary_chain()

    response = await context_summary_chain.ainvoke(
        {
            "context": state["messages"][-1].content,
        }
    )
    state["messages"][-1].content = response.content

    return {}


async def connector_node(state: UFCFighterState):
    return {}