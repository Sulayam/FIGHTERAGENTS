class UFCFighterNameNotFound(Exception):
    """Exception raised when a ufcfighter's name is not found."""

    def __init__(self, ufcfighter_id: str):
        self.message = f"UFCFighter name for {ufcfighter_id} not found."
        super().__init__(self.message)


class UFCFighterPerspectiveNotFound(Exception):
    """Exception raised when a ufcfighter's perspective is not found."""

    def __init__(self, ufcfighter_id: str):
        self.message = f"UFCFighter perspective for {ufcfighter_id} not found."
        super().__init__(self.message)


class UFCFighterStyleNotFound(Exception):
    """Exception raised when a ufcfighter's style is not found."""

    def __init__(self, ufcfighter_id: str):
        self.message = f"UFCFighter style for {ufcfighter_id} not found."
        super().__init__(self.message)


class UFCFighterContextNotFound(Exception):
    """Exception raised when a ufcfighter's context is not found."""

    def __init__(self, ufcfighter_id: str):
        self.message = f"UFCFighter context for {ufcfighter_id} not found."
        super().__init__(self.message)
