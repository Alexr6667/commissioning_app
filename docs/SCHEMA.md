# SharePoint Schema (v2)

Flexible field-key checklist storage. Templates live as JSON on KartModels / SmartSystems.

## Customers
- Title, TrackName, Contact*, SiteAddress, Notes, IsLocked
- PreferredControllerFirmware (JSON, blank=latest)
- PreferredControllerCpfFile (JSON)
- ExternalId

## KartModels
- Title, Description, ChecklistTemplate (JSON array of fields: key, label, type, required, options, section), Active, CurrentRecommendedFirmware

## Karts
- ChassisNumber (unique), Model, Customer, Status, Notes, LatestKnownFirmware

## Components
- SerialNumber, Type (Motor/Controller/Battery/Transponder/BMM/Black Box/etc.), CurrentKart, CurrentSmartSystem, FirmwareVersion, Notes

## SmartSystems
- Title, Customer, SystemType, ChecklistTemplate (JSON), Status, Notes, CurrentSettingsFile

## Tasks
- Title, Type (EndOfLine/Onsite/CustomerVisit), Customer, Assignee, Status, Dates, OverallNotes, TargetFirmwareOverrides (JSON)

## TaskItems
- Task, Kart or SmartSystem, Status, Notes

## ChecklistResponses
- TaskItem, FieldKey, Value, Technician, Timestamp, Attachment

## FirmwareVersions
- Title, Model, Changelog (required), File, IsCurrentRecommended, UploadedBy, UploadDate

## Technicians
- Title, Active, Email

Document libraries: Firmware & CPF, Settings files, Photos, Signed PDFs, Project files.
