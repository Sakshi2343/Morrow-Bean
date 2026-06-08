# Flavor Matcher Microservice

FastAPI microservice for coffee flavor recommendations.

## Endpoints

- `GET /health`
- `POST /train`
- `POST /recommend`

## Local run

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

Set `RECOMMENDER_SERVICE_URL=http://localhost:8001` in the Node app to enable live calls from the MERN backend.
