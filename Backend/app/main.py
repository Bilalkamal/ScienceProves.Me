from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import get_settings
from app.api.routes import question

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    app = FastAPI(
        title=settings.API_TITLE,
        description=settings.API_DESCRIPTION,
        version=settings.API_VERSION
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(question.router, tags=["Questions"])

    @app.get("/", tags=["Root"])
    def read_root():
        """Root endpoint returning API information."""
        return {
            "message": "Welcome to the Science Research API",
            "version": settings.API_VERSION,
            "endpoints": {
                "/ask": "POST/GET - Ask a scientific question",
                "/history/{user_id}": "GET - Get user's question history"
            }
        }

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Global exception handler for unhandled exceptions."""
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return {
            "error": str(exc),
            "message": "An unexpected error occurred",
            "path": request.url.path
        }

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server")
    app = create_application()
    uvicorn.run(app, host="0.0.0.0", port=8000)