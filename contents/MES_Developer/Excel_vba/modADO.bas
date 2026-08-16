Attribute VB_Name = "modADO"
Private Const ThisModuleVersion As Integer = 4

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

Private mDataBase As New ADODB.Connection
Private mRS As New ADODB.Recordset
Private mCmd As New ADODB.Command
    

' Database를 연결
Private Sub OpenConnection()    '(iServer As Integer)
    Dim sConnString As String
    
    If Range("SERVER").text = "운영서버" Then
        sConnString = "Driver={SQL Server};Server=203.249.29.116,1433;Database=MESDB;Uid=sa1;pwd=qwer1234!;Connect Timeout=60;"
    ElseIf Range("SERVER").text = "Huni Home" Then
        sConnString = "Driver={SQL Server};Server=leesh.iptime.org,1214;Database=TESTDB;Uid=mesuser;pwd=hunihome1004;Connect Timeout=60;"
    Else
        sConnString = "Driver={SQL Server};Server=localhost\SQLEXPRESS;Database=MESDB;Uid=mesuser;pwd=mesuser1;Connect Timeout=60;"
    End If

    mDataBase.ConnectionString = sConnString
    
    Call mDataBase.Open

    mCmd.ActiveConnection = mDataBase
End Sub




'모든 Connection의 상태를 Close하고 초기화 한다.
Private Sub CloseConnection()
    'RecordSet의 상태가 열려있으면 먼저 Close 시킨다.
    If Not mRS Is Nothing Then
        If mRS.State = adStateOpen Then mRS.Close
    End If
    Set mRS = Nothing
    
    'Connection의 상태가 열려있으면 먼저 Close 시킨다.
    If Not mDataBase Is Nothing Then
        If mDataBase.State = adStateOpen Then mDataBase.Close
    End If
    Set mDataBase = Nothing
    
    '관련변수를 초기화 한다.
    Set mCmd = Nothing

End Sub

'쿼리를 실행하여 결과를 RecordSet으로 반환 받는다.
Private Function ExecuteCmd(sSQL As String) As Boolean

    On Error GoTo ErrorHandler

    mCmd.CommandText = sSQL
    Set mRS = mCmd.Execute
    
    ExecuteCmd = True
    Exit Function

ErrorHandler:
    ExecuteCmd = False

    If Err <> 0 Then
        'MsgBox Err.Source & "-->" & Err.Description, , "Error"
        MsgBox "[SQL Server에러]" & Mid(Err.Description, 48, 999), , "Error"
    End If
End Function

'저장 프로시져를 호출하고 결과를 배열변수로 반환한다.
Public Function ExecCmd(ByRef sSQL As String) As Variant
    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        Exit Function
    End If

    '개체가 닫혀있으면 실행 금지
    If mRS.State > 0 Then
        'RecordSet에 Return된 값이 아예 없으면 Skip
        '0 건이라도 Return되면State가 0이 아님
        If mRS.BOF = False Or mRS.EOF = False Then
            ExecCmd = mRS.GetRows
        End If
    End If

    
    Call CloseConnection
End Function

'쿼리의 실행결과를 지정된 Sheet의 Range위치에 출력한다.
'복수개의 RecordSet이 반환된 경우 Range도 복수로 지정하면 됨.
Public Function SelectToSheet(ByRef sSQL As String, ByRef xRange As Range, Optional iSkipClear As Integer = 0) As Boolean
    On Error GoTo ErrorHandler
    
    Dim iCount As Integer

    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        SelectToSheet = False
        Exit Function
    End If
    
    SelectToSheet = True

    Application.ScreenUpdating = False
    
    For iCount = 1 To xRange.Areas.Count    '복수로 지정된 Range 갯수
        'Range가 복수로 지정된경우 Item으로 구분한다.
        xRange.Areas.Item(iCount).CurrentRegion.Offset(1, iSkipClear).ClearContents
        xRange.Areas.Item(iCount).Offset(0, iSkipClear).CopyFromRecordset mRS
        
        'Data가 없는 경우가 하나라도 있으면 False를 반환
        If mRS.BOF = True And mRS.EOF = True Then
            SelectToSheet = False
        End If
            
        Set mRS = mRS.NextRecordset

    Next
  
    ' clean up
    Call CloseConnection
    
    Application.ScreenUpdating = True
    
    Exit Function
  
ErrorHandler:
    Call CloseConnection
  
    If Err <> 0 Then
        MsgBox "[SQL Server에러]" & Mid(Err.Description, 48, 999), , "Error"
    End If
End Function

'쿼리의 실행결과를 지정된 Sheet의 Range위치에 출력한다.
'복수개의 RecordSet이 반환된 경우 Range도 복수로 지정하면 됨.
Public Function SelectToRange(ByRef sSQL As String, ByRef xRange As Range) As Boolean
    On Error GoTo ErrorHandler
    
    Dim iCount As Integer

    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        SelectToRange = False
        Exit Function
    End If
    
    SelectToRange = True

    Application.ScreenUpdating = False
    
    For iCount = 1 To xRange.Areas.Count    '복수로 지정된 Range 갯수
        'Range가 복수로 지정된경우 Item으로 구분한다.
        xRange.Areas.Item(iCount).ClearContents
        xRange.Areas.Item(iCount).CopyFromRecordset mRS
        
        'Data가 없는 경우가 하나라도 있으면 False를 반환
        If mRS.BOF = True And mRS.EOF = True Then
            SelectToRange = False
        End If
            
        Set mRS = mRS.NextRecordset

    Next
  
    ' clean up
    Call CloseConnection
    
    Application.ScreenUpdating = True
    
    Exit Function
  
ErrorHandler:
    Call CloseConnection
  
    If Err <> 0 Then
        MsgBox "[SQL Server에러]" & Mid(Err.Description, 48, 999), , "Error"
    End If
End Function
    
'하나의 값만 반환
Public Function OneSelect(ByVal sGubun As String, ByVal sFindValue As String) As String
    
    Dim sSQL As String
   
    OneSelect = ""
    
    sSQL = "One_Select '" + sGubun + "', '" + sFindValue + "'"
    
    
    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        Exit Function
    End If

    '개체가 닫혀있으면 실행 금지
    If mRS.State > 0 Then
        'RecordSet에 Return된 값이 아예 없으면 Skip
        '0 건이라도 Return되면State가 0이 아님
        If mRS.BOF = False Or mRS.EOF = False Then
            OneSelect = mRS(0).value
        End If
    End If

    
    Call CloseConnection
    
End Function

'Database에서 읽은 RecordSet의 Data를 TreeView에 저장한다.
Public Sub SelectToTreeview(sSQL As String, xTreeView As TreeView)
    On Error GoTo ErrorHandler
    
    Dim iCount As Integer
    Dim xNode As Node
    Dim sNodetext As String

    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        Exit Sub
    End If
    
    xTreeView.Nodes.Clear
    
   Do Until mRS.EOF
        sNodetext = mRS!Type.value & " > " & mRS!Material.value & " : " & mRS!Name.value & " * " & mRS!Qty.value & " EA"
        
        If mRS!Type = "FERT" Then
            Set xNode = xTreeView.Nodes.Add(, , Key:=mRS!Material.value, text:=sNodetext)
        Else
           Set xNode = xTreeView.Nodes.Add(mRS!Parents.value, tvwChild, mRS!Material.value, sNodetext)
        End If
            
        xNode.Expanded = True

      mRS.MoveNext
   Loop
    
    ' clean up
    Call CloseConnection
    Exit Sub
  
ErrorHandler:
    Call CloseConnection
  
    If Err <> 0 Then
        MsgBox "[SQL Server에러]" & Mid(Err.Description, 48, 999), , "Error"
    End If
End Sub



'사원이름이 Database에 등록되어 있는지 검사한다.
Public Function MESUserCheck(sUserName As String) As Boolean
    Dim sSQL As String
    Dim xResult As Variant
    
    sSQL = "One_Select '사원번호', '" + sUserName + "'"

    xResult = ExecCmd(sSQL)
    
    If IsEmpty(xResult) Then
        MsgBox "데이터베이스에 등록되지않은 작업자 입니다."
        MESUserCheck = False
        Exit Function
    End If
    
    MESUserCheck = True

End Function

'현재 PC의 IP Address를 검사한다.
Private Function IPAssressCheck(sCheckIPAddress As String) As Boolean
    Dim NIC As Variant
    Dim NICs As Object
    Dim iSize As Integer
    
    iSize = Len(sCheckIPAddress)
        
    Set NICs = GetObject("winmgmts:").InstancesOf("Win32_NetworkAdapterConfiguration")

    For Each NIC In NICs
        If NIC.IPEnabled Then
            If Left(NIC.IPAddress(0), iSize) = sCheckIPAddress Then
                IPAssressCheck = True
                Exit Function
            End If
        End If
    Next NIC
    IPAssressCheck = False
End Function


Public Sub UpgradeFileSave()
    Dim sSQL As String
    Dim xStream As ADODB.Stream
    Dim sFilename As String
    Dim iCount As Integer
    
    Set xStream = New ADODB.Stream
    xStream.Type = adTypeBinary
    xStream.Open
    
    On Error GoTo ErrorHandler
    
    ThisWorkbook.SaveCopyAs ("__MES_Save_Copy_File__.xlsm")
    
    sFilename = ThisWorkbook.Name
    sSQL = "SELECT * FROM dbo.UpgradeFiles WHERE FileName = '" & sFilename & "'"
    
    
    Call OpenConnection
    
    mRS.Open sSQL, mDataBase, adOpenKeyset, adLockOptimistic
    
    If mRS.EOF Then
        mRS.AddNew
    End If

    xStream.LoadFromFile "__MES_Save_Copy_File__.xlsm"
    mRS.Fields("FileNAme").value = sFilename
    mRS.Fields("Version").value = mRS.Fields("Version").value + 1
    mRS.Fields("Data").value = xStream.Read
    mRS.Fields("EventTime").value = DateTime.Now()
    mRS.Fields("EventUser").value = MES_Master.Range("WORKER")
    mRS.Update
    
    xStream.Close
    ' clean up
    Call CloseConnection
    Kill "__MES_Save_Copy_File__.xlsm"
    Exit Sub
  
ErrorHandler:
    xStream.Close
    Call CloseConnection
    Kill "__MES_Save_Copy_File__.xlsm"
  
    If Err <> 0 Then
        MsgBox "[SQL Server에러]" & Mid(Err.Description, 48, 999), , "Error"
    End If

End Sub

Public Sub UpgradeFileLoad(sFilename As String)
    Dim sSQL As String
    Dim xStream As ADODB.Stream
    
    Set xStream = New ADODB.Stream
    xStream.Type = adTypeBinary
    xStream.Open
    
    On Error GoTo ErrorHandler
    
    sSQL = "SELECT * FROM dbo.UpgradeFiles WHERE FileName = '" & sFilename & "'"
    
    Call OpenConnection
    
    mRS.Open sSQL, mDataBase, adOpenKeyset, adLockOptimistic
    
    If mRS.EOF Then
        MsgBox "저장된 파일이 없습니다."
        Exit Sub
    End If

    xStream.Write mRS!Data
    xStream.SaveToFile sFilename
    
    xStream.Close
    ' clean up
    Call CloseConnection
    Exit Sub
  
ErrorHandler:
    xStream.Close
    Call CloseConnection
  
    If Err <> 0 Then
        MsgBox "[SQL Server에러]" & Mid(Err.Description, 48, 999), , "Error"
    End If

End Sub

