{
  description = "A documentation browser for Auxolotl";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  inputs.snowfall-lib = {
    url = "github:snowfallorg/lib";
    inputs.nixpkgs.follows = "nixpkgs";
  };
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  inputs.wiki = {
    url = "github:auxolotl/wiki";
    flake = false;
  };

  outputs =
    inputs:
    inputs.snowfall-lib.mkFlake {
      inherit inputs;

      src = ./.;

      alias.packages.default = "docs-site";

      snowfall = {
        root = ./nix;
        namespace = "auxolotl--docs-site";
      };

      outputs-builder = channels: { formatter = channels.nixpkgs.nixfmt-rfc-style; };
    };
}
