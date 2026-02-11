.PHONY: build release restart

build:
	bash ./local-build.sh

release: build
	sudo cp target/release/server /usr/local/bin/vibe-kanban
	sudo chmod 755 /usr/local/bin/vibe-kanban
	sudo systemctl restart vibe-kanban
	@echo "✅ /usr/local/bin/vibe-kanban を更新し、サービスを再起動しました"
