from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = "local"
    database_url: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
