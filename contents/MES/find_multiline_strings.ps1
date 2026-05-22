$errors = $null
$tokens = $null
$AST = [System.Management.Automation.Language.Parser]::ParseFile("C:\Users\junipa7\Documents\myhomepage\contents\MES\split_diagrams.ps1", [ref]$tokens, [ref]$errors)

Write-Host "Searching for multi-line strings in AST..."
$strings = $AST.FindAll({ $args[0] -is [System.Management.Automation.Language.StringConstantExpressionAst] }, $true)
foreach ($s in $strings) {
    if ($s.Extent.StartLineNumber -ne $s.Extent.EndLineNumber) {
        Write-Host "String Constant: Starts at line $($s.Extent.StartLineNumber) column $($s.Extent.StartColumnNumber), ends at line $($s.Extent.EndLineNumber) column $($s.Extent.EndColumnNumber)"
    }
}

Write-Host "Searching for expandable strings (double-quoted/here-strings) in AST..."
$expStrings = $AST.FindAll({ $args[0] -is [System.Management.Automation.Language.ExpandableStringExpressionAst] }, $true)
foreach ($s in $expStrings) {
    if ($s.Extent.StartLineNumber -ne $s.Extent.EndLineNumber) {
        Write-Host "Expandable String: Starts at line $($s.Extent.StartLineNumber) column $($s.Extent.StartColumnNumber), ends at line $($s.Extent.EndLineNumber) column $($s.Extent.EndColumnNumber)"
    }
}
