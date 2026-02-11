SHELL := /usr/bin/env bash

SYSTEMD_DIR := /etc/systemd/system
PROXY_UNIT := vibe-kanban-mobile-proxy.service
UPSTREAM_UNIT := vibe-kanban.service
LOCAL_SYSTEMD_DIR := systemd

.PHONY: help install-units register reload restart status logs stop start disable enable uninstall

help:
	@echo "mobile-proxy systemd helper targets:"
	@echo "  make register   - install/update unit files, daemon-reload, enable + restart services"
	@echo "  make status     - show both service statuses"
	@echo "  make logs       - tail proxy service logs"
	@echo "  make restart    - restart upstream + proxy services"
	@echo "  make stop       - stop proxy service"
	@echo "  make start      - start proxy service"
	@echo "  make disable    - disable proxy service autostart"
	@echo "  make enable     - enable proxy service autostart"
	@echo "  make uninstall  - disable and remove proxy unit file"

install-units:
	sudo install -m 644 "$(LOCAL_SYSTEMD_DIR)/$(UPSTREAM_UNIT)" "$(SYSTEMD_DIR)/$(UPSTREAM_UNIT)"
	sudo install -m 644 "$(LOCAL_SYSTEMD_DIR)/$(PROXY_UNIT)" "$(SYSTEMD_DIR)/$(PROXY_UNIT)"

reload:
	sudo systemctl daemon-reload

enable:
	sudo systemctl enable "$(PROXY_UNIT)"

disable:
	sudo systemctl disable "$(PROXY_UNIT)"

restart:
	sudo systemctl restart "$(UPSTREAM_UNIT)"
	sudo systemctl restart "$(PROXY_UNIT)"

start:
	sudo systemctl start "$(PROXY_UNIT)"

stop:
	sudo systemctl stop "$(PROXY_UNIT)"

status:
	systemctl status "$(UPSTREAM_UNIT)" --no-pager
	systemctl status "$(PROXY_UNIT)" --no-pager

logs:
	journalctl -u "$(PROXY_UNIT)" -f

register: install-units reload enable restart status

uninstall:
	sudo systemctl disable --now "$(PROXY_UNIT)" || true
	sudo rm -f "$(SYSTEMD_DIR)/$(PROXY_UNIT)"
	sudo systemctl daemon-reload
