$specialtyData = @(
    @{id="68074e9b317fd88edbf60caf"; name="Nội tổng quát"},
    @{id="680753f595d19d689696e92a"; name="Ngoại thần kinh"},
    @{id="680753f595d19d689696e92b"; name="Sản phụ khoa"},
    @{id="680753f595d19d689696e92d"; name="Da liễu"},
    @{id="680753f595d19d689696e92c"; name="Tai mũi họng"},
    @{id="6807559e0eb4ee736d8f55a4"; name="Răng hàm mặt"},
    @{id="680755d30eb4ee736d8f55a6"; name="Nhi khoa"},
    @{id="680755d30eb4ee736d8f55a7"; name="Tim mạch"},
    @{id="683dad2f3c70404743761eb6"; name="Tổng quát"},
    @{id="683dad383c70404743761eba"; name="HPV"},
    @{id="683dad763c70404743761ebe"; name="Sức khỏe sinh sản"},
    @{id="683dad7e3c70404743761ec2"; name="Tiểu đường"},
    @{id="683dad853c70404743761ec6"; name="Tiền hôn nhân"},
    @{id="683dad8d3c70404743761eca"; name="Ký sinh trùng"},
    @{id="683dad933c70404743761ece"; name="Ung thư"},
    @{id="683dad9b3c70404743761ed2"; name="Vitamin"},
    @{id="683dadba3c70404743761ed5"; name="STD"},
    @{id="683dadba3c70404743761ed6"; name="Gan"},
    @{id="683dadba3c70404743761ed7"; name="Viêm gan"},
    @{id="683dadba3c70404743761ed8"; name="Thận"},
    @{id="683dadba3c70404743761ed9"; name="Dị ứng"},
    @{id="683dae333c70404743761f13"; name="Chất gây nghiện"},
    @{id="683dae333c70404743761f14"; name="Loãng xương"},
    @{id="683dae523c70404743761f27"; name="Bất dung nạp thực phẩm"},
    @{id="683dae523c70404743761f28"; name="Tuyến giáp"},
    @{id="683dae523c70404743761f29"; name="Tiền sản giật"},
    @{id="683dae523c70404743761f2a"; name="Tiểu đường thai kỳ"},
    @{id="683dae523c70404743761f2b"; name="Fitness"},
    @{id="683dae523c70404743761f2c"; name="Huyết thống"},
    @{id="683dae523c70404743761f2d"; name="Sốt"},
    @{id="683dae523c70404743761f2e"; name="Sức khỏe thai kỳ"},
    @{id="683dae523c70404743761f2f"; name="Nhiễm trùng đường tiểu"},
    @{id="683dae523c70404743761f30"; name="Viêm khớp"},
    @{id="683dae993c70404743761f61"; name="Mỡ máu"}
)

# Define mapping between current file names and specialty names
$fileToSpecialtyMapping = @{
    "tongquat.svg" = "Tổng quát"
    "4464b0a5-ung-thu.svg" = "Ung thư"
    "0f868f93-tieu-duong-thai-ky.svg" = "Tiểu đường thai kỳ"
    "d6b0e15b-tien-san-giat.svg" = "Tiền sản giật"
    "9520491b-xet-nghiem-mo-mau.svg" = "Mỡ máu"
    "830b2f12-di-ung.svg" = "Dị ứng"
    "a0b73412-bat-dung-nap-222-thuc-pham.svg" = "Bất dung nạp thực phẩm"
    "f63ba595-viem-gan-sieu-vi.svg" = "Viêm gan"
    # Generic files will be assigned to remaining specialties
    "00feb122-frame-1171277892.svg" = "Nội tổng quát"
    "027e906d-frame-1171277950.svg" = "Ngoại thần kinh"
    "038a0f44-frame-1171277950.svg" = "Sản phụ khoa"
    "14ee25c8-frame-1171277950.svg" = "Da liễu"
    "152d0ca1-frame-1171277950.svg" = "Tai mũi họng"
    "1998cac9-frame-1171277897.svg" = "Răng hàm mặt"
    "2.svg" = "Nhi khoa"
    "40351362-frame-1171277951.svg" = "Tim mạch"
    "48e06e6f-frame-1171277892.svg" = "HPV"
    "63643654-frame-1000003952.svg" = "Sức khỏe sinh sản"
    "9cb8a7c9-frame-1171277892.svg" = "Tiểu đường"
    "9ebde33a-frame-1171277950.svg" = "Tiền hôn nhân"
    "a47ad230-frame-1000003952.svg" = "Ký sinh trùng"
    "cc78d5f9-frame-1171277950.svg" = "Vitamin"
    "d2f84f62-frame-1171277892.svg" = "STD"
    "da13a4f4-frame-1171277950.svg" = "Gan"
    "e44260d3-frame-1171277895.svg" = "Thận"
    "f5446747-frame-1171277950.svg" = "Chất gây nghiện"
}

# Create a directory for backup
$backupDir = "public\icons\specialties_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force

# Copy all files to backup directory
Copy-Item -Path "public\icons\specialties\*" -Destination $backupDir

# Get all SVG files in the specialties directory
$svgFiles = Get-ChildItem -Path "public\icons\specialties\*.svg"

# Create a hashtable to track which specialties have been assigned
$assignedSpecialties = @{}

# Create a hashtable for specialty ID lookup
$specialtyIdByName = @{}
foreach ($specialty in $specialtyData) {
    $specialtyIdByName[$specialty.name] = $specialty.id
}

# Rename files based on the mapping
foreach ($file in $svgFiles) {
    $originalFileName = $file.Name
    
    # Check if this file has a specific mapping
    if ($fileToSpecialtyMapping.ContainsKey($originalFileName)) {
        $specialtyName = $fileToSpecialtyMapping[$originalFileName]
        
        # Check if the specialty name exists in our data
        if ($specialtyIdByName.ContainsKey($specialtyName)) {
            $specialtyId = $specialtyIdByName[$specialtyName]
            $newFileName = "$specialtyId.svg"
            
            # Rename the file
            $newPath = Join-Path -Path $file.DirectoryName -ChildPath $newFileName
            Rename-Item -Path $file.FullName -NewName $newFileName -Force
            
            Write-Host "Renamed $originalFileName to $newFileName ($specialtyName)"
            
            # Mark this specialty as assigned
            $assignedSpecialties[$specialtyName] = $true
        } else {
            Write-Host "Warning: Specialty '$specialtyName' not found in the data for file $originalFileName"
        }
    }
}

# Assign remaining files to unassigned specialties
$remainingFiles = Get-ChildItem -Path "public\icons\specialties\*.svg" | Where-Object { 
    $_.Name -notmatch "^[0-9a-f]{24}\.svg$" 
}

$unassignedSpecialties = $specialtyData | Where-Object { -not $assignedSpecialties.ContainsKey($_.name) }
$specialtyIndex = 0

foreach ($file in $remainingFiles) {
    if ($specialtyIndex -lt $unassignedSpecialties.Count) {
        $specialty = $unassignedSpecialties[$specialtyIndex]
        $newFileName = "$($specialty.id).svg"
        
        # Rename the file
        $newPath = Join-Path -Path $file.DirectoryName -ChildPath $newFileName
        Rename-Item -Path $file.FullName -NewName $newFileName -Force
        
        Write-Host "Assigned $($file.Name) to $newFileName ($($specialty.name))"
        
        $specialtyIndex++
    } else {
        Write-Host "Warning: No more unassigned specialties for file $($file.Name)"
    }
}

Write-Host "All specialty icons have been renamed. Backup created in $backupDir" 