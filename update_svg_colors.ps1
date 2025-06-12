$svgFiles = Get-ChildItem -Path "public\icons\specialties\*.svg" | Where-Object { $_.Name -ne "tongquat.svg" }

foreach ($file in $svgFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace fill colors - specifically target blue color variations
    $content = $content -replace 'fill="#AACEFF"', 'fill="#24AE7C"'
    $content = $content -replace 'fill="#00327D"', 'fill="#1A7F5A"'
    $content = $content -replace 'fill="#A3D4FF"', 'fill="#24AE7C"'
    $content = $content -replace 'fill="#EAF3FF"', 'fill="#24AE7C"'
    $content = $content -replace 'fill="#CBE1FF"', 'fill="#24AE7C"'
    
    # Replace stroke colors - specifically target all blue variations
    $content = $content -replace 'stroke="#00327D"', 'stroke="#1A7F5A"'
    $content = $content -replace 'stroke="#2A4F80"', 'stroke="#1A7F5A"'
    
    # Make background transparent by removing the white rectangle
    # This pattern is more specific to match the various forms of the background rectangle
    $content = $content -replace '<rect [^>]*width="72" height="72" rx="36" fill="white"[^>]*></rect>\r?\n?', ''
    $content = $content -replace '<rect [^>]*width="72" height="72" rx="36" fill="white"[^>]*\/>\r?\n?', ''
    
    # Save the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "Updated colors in $($file.Name)"
}

Write-Host "All SVG files have been updated." 