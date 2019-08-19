git pull && git rev-parse --abbrev-ref HEAD > build.txt && git rev-parse HEAD >> build.txt && docker-compose up --build -d
