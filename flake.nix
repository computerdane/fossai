{
  description = "AI that's actually FOSS";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      flake.nixosModules.fossai = import ./nix/module.nix;
      perSystem =
        { pkgs, ... }:
        {
          devShells.default =
            with pkgs;
            mkShell {
              buildInputs = [
                bun
                postgresql
              ];
              shellHook = "bun i";
            };
        };
    };
}
