from langgraph.graph import MessagesState


class UFCFighterState(MessagesState):
    """State class for the LangGraph workflow. It keeps track of the information necessary to maintain a coherent
    conversation between the UFCFighter and the user.

    Attributes:
        ufcfighter_context (str): The historical and philosophical context of the ufcfighter.
        ufcfighter_name (str): The name of the ufcfighter.
        ufcfighter_perspective (str): The perspective of the ufcfighter about AI.
        ufcfighter_style (str): The style of the ufcfighter.
        summary (str): A summary of the conversation. This is used to reduce the token usage of the model.
    """

    ufcfighter_context: str
    ufcfighter_name: str
    ufcfighter_perspective: str
    ufcfighter_style: str
    summary: str


def state_to_str(state: UFCFighterState) -> str:
    if "summary" in state and bool(state["summary"]):
        conversation = state["summary"]
    elif "messages" in state and bool(state["messages"]):
        conversation = state["messages"]
    else:
        conversation = ""

    return f"""
UFCFighterState(ufcfighter_context={state["ufcfighter_context"]},
ufcfighter_name={state["ufcfighter_name"]},
ufcfighter_perspective={state["ufcfighter_perspective"]},
ufcfighter_style={state["ufcfighter_style"]},
conversation={conversation})
        """
