[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/madss-bin/relay_proxy)

## Usage

### GET Request
Fetch content from a URL:
```bash
# Base64 encode your URL first

curl "https://example.com/?url=aHR0cHM6Ly9leGFtcGxlLmNvbQ=="
```

### POST Request
Forward POST data to a URL:
```bash
curl -X POST "https://example.com/?url={base64_url}" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```
