from fastapi import FastAPI

app = FastAPI(
    title="LOCAL ROUTE API"
)

@app.get("/")
def health_check():
    return {"status": "ok"}
