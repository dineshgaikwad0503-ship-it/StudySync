# Architecture

React handles UI, Django provides REST/business APIs, MongoDB is the document database, the Node Socket.IO service handles low-latency events, and S3 stores uploaded resources.

Flow:
Browser -> React -> Django REST
Browser -> Socket.IO -> Room gateway -> connected browsers
Browser -> upload endpoint -> S3 -> resource metadata
