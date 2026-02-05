#Using python
FROM python:3.10-slim
#sets working directory as app
WORKDIR /app

COPY . /app


#pip install the req.txt
RUN pip install --no-cache-dir -r requirements.txt

#TODO: Change this part to be more secure
ENV GOOGLE_APPLICATION_CREDENTIALS=golden-memory-427416-s4-a1214d1197e4.json

# Make port 8080 available to the world outside this container
EXPOSE 8080
ENV PORT 8080
#TODO: I think I can remove this line of code
COPY app/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
