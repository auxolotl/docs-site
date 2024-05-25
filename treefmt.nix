# treefmt.nix
{ pkgs, ... }:
{
  # Used to find the project root
  projectRootFile = "flake.nix";

  # go
  programs.gofmt.enable = true;

  # js/ts
  programs.prettier.enable = true;

  # markdown
  programs.mdformat.enable = true;

  # nix
  programs.nixfmt-rfc-style.enable = true;
  programs.statix.enable = true;

  # python
  programs.black.enable = true;

  # rust
  programs.rustfmt.enable = true;

  # swift
  programs.swift-format.enable = true;
}
