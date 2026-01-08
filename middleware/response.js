function responseHelpers(req, res, next) {
  res.success = (data = null, message = 'ok', status = 200) => {
    res.status(status).json({ success: true, message, data });
  };

  res.error = (message = 'error', status = 500, details) => {
    const body = { success: false, message };
    if (details) body.details = details;
    res.status(status).json(body);
  };

  next();
}

module.exports = responseHelpers;

