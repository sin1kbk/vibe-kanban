SHELL := /usr/bin/env bash

SYSTEMD_DIR := /etc/systemd/system
PROXY_UNIT := vibe-kanban-mobile-proxy.service
UPSTREAM_UNIT := vibe-kanban.service
LOCAL_SYSTEMD_DIR := systemd
# Repo root (parent of mobile-proxy); override if needed when running make from mobile-proxy/
REPO_ROOT ?= $(abspath $(CURDIR)/..)

.PHONY: help install-units register reload restart status logs stop start disable enable uninstall run deps

help:
	@echo "mobile-proxy Makefile:"
	@echo "  make deps       - install node dependencies (npm install) for the proxy"
	@echo "  make run        - run proxy locally (no systemd); needs TARGET_ORIGIN if upstream not 127.0.0.1:3000"
	@echo "  make register   - deps + install/update unit files, daemon-reload, enable + restart services"
	@echo "  make status     - show both service statuses"
	@echo "  make logs       - tail proxy service logs"
	@echo "  make restart    - restart upstream + proxy services"
	@echo "  make stop       - stop proxy service"
	@echo "  make start      - start proxy service"
	@echo "  make disable    - disable proxy service autostart"
	@echo "  make enable     - enable proxy service autostart"
	@echo "  make uninstall  - disable and remove proxy unit file"

deps:
	npm install

run: deps
	exec node proxy.mjs

install-units:
	@echo "Using REPO_ROOT=$(REPO_ROOT)"
	sed 's|{{REPO_ROOT}}|$(REPO_ROOT)|g' "$(LOCAL_SYSTEMD_DIR)/$(UPSTREAM_UNIT)" | sudo tee "$(SYSTEMD_DIR)/$(UPSTREAM_UNIT)" > /dev/null
	sed 's|{{REPO_ROOT}}|$(REPO_ROOT)|g' "$(LOCAL_SYSTEMD_DIR)/$(PROXY_UNIT)" | sudo tee "$(SYSTEMD_DIR)/$(PROXY_UNIT)" > /dev/null

reload:
	sudo systemctl daemon-reload

enable:
	sudo systemctl enable "$(UPSTREAM_UNIT)"
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

register: deps install-units reload enable restart status

uninstall:
	sudo systemctl disable --now "$(PROXY_UNIT)" || true
	sudo rm -f "$(SYSTEMD_DIR)/$(PROXY_UNIT)"
	sudo systemctl daemon-reload
