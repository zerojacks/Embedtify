# Test Plan API Documentation

## POST /api/testplan/start

### Description
This endpoint starts a test plan.

### Request Body
- `testPlan` (object): The test plan to be started.

### Responses
- `200 OK`: Test plan was started successfully.
- `500 Internal Server Error`: Failed to start test plan due to an internal error.

## POST /api/testplan/pause

### Description
This endpoint pauses the currently running test plan.

### Responses
- `200 OK`: Test plan was paused successfully.
- `500 Internal Server Error`: Failed to pause test plan due to an internal error.

### Example