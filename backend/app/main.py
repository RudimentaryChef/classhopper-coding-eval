import uvicorn
from fastapi import FastAPI
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware
import os
import importlib
#creates a fast api app
def create_app() -> FastAPI:
    app = FastAPI(redirect_slashes=False)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    #for all the routes in our folder it adds it
    routes_dir = os.path.join(os.path.dirname(__file__), "routes")
    for filename in os.listdir(routes_dir):
        if filename.endswith(".py") and "routes" in filename:
            module_name = f"app.routes.{filename[:-3]}"
            module = importlib.import_module(module_name)
            if hasattr(module, "router"):
                app.include_router(module.router)
    @app.get("/")
    async def base():
        return {"Hello": "You have reached the / route without issues"}

    return app
app = create_app()
if __name__ == "__main__":
    #TODO: Change this to work with a custom route
    uvicorn.run(app, host="0.0.0.0", port=8080)
