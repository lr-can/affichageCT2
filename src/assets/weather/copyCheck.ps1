# Parcourt tous les fichiers se terminant par "0.png" dans le dossier courant
Get-ChildItem -Filter "*0.png" | ForEach-Object {
    $fichier = $_
    # Remplace "0.png" par "1.png" uniquement à la fin du nom
    $nouveauNom = $fichier.Name -replace "0\.png$", "1.png"
    
    # Vérifie si le fichier homologué existe déjà
    if (-not (Test-Path -Path $nouveauNom)) {
        Write-Output "Création de $nouveauNom à partir de $($fichier.Name)"
        Copy-Item -Path $fichier.FullName -Destination $nouveauNom
    }
    else {
        Write-Output "$nouveauNom existe déjà, passage au fichier suivant."
    }
}
