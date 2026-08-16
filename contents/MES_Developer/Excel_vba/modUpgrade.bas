Attribute VB_Name = "modUpgrade"
Private Const ThisModuleVersion As Integer = 1

Option Explicit

Sub UpgradeModuleSave()
    'SaveCodeModules "C:\Users\Public\Documents\ExcelBackup\"
    Dim xMyCom As Object 'VBComponent
    Dim sSQL As String
    Dim sType As String
    Dim sData As String

    For Each xMyCom In ThisWorkbook.VBProject.VBComponents
        If xMyCom.CodeModule.CountOfLines > 0 Then
        
            sData = StrConv(xMyCom.CodeModule.Lines(2, xMyCom.CodeModule.CountOfLines), vbWide)
            If xMyCom.Type = 1 Then
                sType = "Excel_Module"
            ElseIf xMyCom.Type = 2 Then
                sType = "Excel_ClassModule"
            ElseIf xMyCom.Type = 3 Then
                sType = "Excel_From"
            ElseIf xMyCom.Type = 100 Then
                sType = "Excel_Sheet"
            End If
            
            '저장인 경우 호출할 명령 지정
            sSQL = "dbo.UpgradeMaster_Save '" + xMyCom.CodeModule.Name + "', '" + sType + "', '" + sData + "', '" + MES_Master.Range("WORKER").text + "'"
            Call ExecCmd(sSQL)
            
        End If
    Next
    
    MsgBox "전체 Module이 저장되었습니다."
End Sub

Sub UpgradeModuleLoad()
    'ImportCodeModules "C:\Users\Public\Documents\ExcelBackup\"
    Dim xMyCom As Object 'VBComponent
    Dim sType As String
    Dim sData As String

    For Each xMyCom In ThisWorkbook.VBProject.VBComponents
        If xMyCom.CodeModule.Name <> "modUpgrade" Then
            
            sData = StrConv(UpgradeSelect("업그래이드", xMyCom.CodeModule.Name), vbNarrow)
            
            If Len(sData) > 1 Then
                xMyCom.CodeModule.DeleteLines 1, xMyCom.CodeModule.CountOfLines
                xMyCom.CodeModule.AddFromString sData
            End If
            
        End If
    Next
    
    MsgBox "전체 Module이 Loading되었습니다."
End Sub

'하나의 값만 반환
Private Function UpgradeSelect(ByRef sGubun As String, ByRef sFindValue As String) As String
    Dim mConnection As New ADODB.Connection
    Dim mRecordSet As New ADODB.Recordset
    Dim mCommand As New ADODB.Command

    'Call OpenConnection
    mConnection.ConnectionString = "Driver={SQL Server};Server=203.249.29.116,1433;Database=MESDB;Uid=sa1;pwd=qwer1234!;Connect Timeout=60;"
    Call mConnection.Open
    mCommand.ActiveConnection = mConnection
    
    'ExecuteCmd
    mCommand.CommandText = "One_Select '" + sGubun + "', '" + sFindValue + "'"
    Set mRecordSet = mCommand.Execute
    
    '개체가 닫혀있으면 실행 금지
    If mRecordSet.State > 0 Then
        'RecordSet에 Return된 값이 아예 없으면 Skip
        '0 건이라도 Return되면State가 0이 아님
        If mRecordSet.BOF = False Or mRecordSet.EOF = False Then
            'mRecordSet.MoveFirst
            
            UpgradeSelect = mRecordSet(0).value
        End If
    End If
    
    'RecordSet의 상태가 열려있으면 먼저 Close 시킨다.
    If Not mRecordSet Is Nothing Then
        If mRecordSet.State = adStateOpen Then mRecordSet.Close
    End If
    Set mRecordSet = Nothing
    
    'Connection의 상태가 열려있으면 먼저 Close 시킨다.
    If Not mConnection Is Nothing Then
        If mConnection.State = adStateOpen Then mConnection.Close
    End If
    Set mConnection = Nothing
    
    '관련변수를 초기화 한다.
    Set mCommand = Nothing
    
End Function

Private Function BinaryToHex(Binary)
  Dim c1, Out, OneByte

  'For each source byte
  For c1 = 1 To LenB(Binary)
    'Get the byte As hex
    OneByte = Hex(AscB(MidB(Binary, c1, 1)))

    'append zero For bytes < 0x10
    If Len(OneByte) = 1 Then OneByte = "0" & OneByte

    'join the byte To OutPut stream
    Out = Out & OneByte
  Next

  'Set OutPut value
  BinaryToHex = Out
End Function

'Sub docversion()
'Dim dlvVersions As Office.DocumentLibraryVersions
'    Dim dlvVersion As Office.DocumentLibraryVersion
'    Dim strVersionInfo As String
'
'    Set dlvVersions = ThisWorkbook.DocumentLibraryVersions
'    If dlvVersions.IsVersioningEnabled Then
'        strVersionInfo = "This document has " & _
'        dlvVersions.Count & " versions: " & vbCrLf
'        For Each dlvVersion In dlvVersions
'            strVersionInfo = strVersionInfo & _
'            " - Version #: " & dlvVersion.Index & vbCrLf & _
'            " - Modified by: " & dlvVersion.ModifiedBy & vbCrLf & _
'            " - Modified on: " & dlvVersion.Modified & vbCrLf & _
'            " - Comments: " & dlvVersion.Comments & vbCrLf
'        Next
'    Else
'        strVersionInfo = "Versioning not enabled for this document."
'    End If
'
'    MsgBox strVersionInfo, vbInformation + vbOKOnly, "Version Information"
'    Set dlvVersion = Nothing
'    Set dlvVersions = Nothing
'End Sub



