{
  lib,
  writeScriptBin,
  buildNpmPackage,
  inputs,
  ...
}:
let
  json = lib.importJSON (lib.snowfall.fs.get-file "package.json");
in
buildNpmPackage {
  pname = "aux-website";
  inherit (json) version;

  src = lib.snowfall.fs.get-file "/";

  npmDepsHash = "sha256-0j7m82hgronEuNFT0D/G21EXr/VGAF5zLIiDbDvT4Ek=";

  npmFlags = [ "--ignore-scripts" ];

  postUnpack = ''
    mkdir -p $sourceRoot/src/content
    cp -r ${inputs.wiki} $sourceRoot/src/content/wiki
  '';

  installPhase = ''
    mkdir -p $out

    cp -r ./dist/* $out/
  '';
}
