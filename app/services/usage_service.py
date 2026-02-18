from app.models.usage import UsageLog

def log_usage(db, user_id, text_length, file_size, duration, response_time):
    log = UsageLog(
        user_id=user_id,
        text_length=text_length,
        file_size=file_size,
        duration=duration,
        response_time=response_time
    )
    db.add(log)
    db.commit()
