Attribute VB_Name = "modADO"
Private Const ThisModuleVersion As Integer = 4

Option Explicit   '변수 선언 강제

Private mDataBase As New ADODB.Connection
Private mRS As New ADODB.Recordset
Private mCmd As New ADODB.Command
    

' Database에 연결
Private Sub OpenConnection()    '(iServer As Integer)
    Dim sConnString As String
    
    If Range("SERVER").text = "운영서버" Then
        sConnString = "Driver={SQL Server};Server=203.249.29.116,1433;Database=MESDB;Uid=sa1;pwd=qwer1234!;Connect Timeout=60;"
    ElseIf Range("SERVER").text = "Huni Home" Then
        sConnString = "Driver={SQL Server};Server=leesh.iptime.org,1214;Database=TESTDB;Uid=mesuser;pwd=hunihome1004;Connect Timeout=60;"
    Else
        sConnString = "Driver={SQL Server};Server=localhost\SQLEXPRESS;Database=MESDB;Uid=mesuser;pwd=mesuser1;Connect Timeout=60;"
    End If
    
    'Connection에 연결문자열 설정
    mDataBase.ConnectionString = sConnString
    
    'DB Open
    Call mDataBase.Open
    
    'Command에 활성 연결 할당
    mCmd.ActiveConnection = mDataBase
    
End Sub

' Database 연결 종료
Private Sub CloseConnection()

    'RecordSet 객체가 열려 있으면 Close 시킨다.
    If Not mRS Is Nothing Then
        If mRS.State = adStateOpen Then mRS.Close
    End If
    Set mRS = Nothing
    
    'Connection 객체가 열려 있으면 Close 시킨다.
    If Not mDataBase Is Nothing Then
        If mDataBase.State = adStateOpen Then mDataBase.Close
    End If
    Set mDataBase = Nothing
    
    '커맨드 초기화
    Set mCmd = Nothing

End Sub

' Database에 명령 실행
Private Function ExecuteCmd(ByRef sSQL As String) As Boolean
    On Error GoTo ErrorHandler
    
    ExecuteCmd = True
    mCmd.CommandText = sSQL
    Set mRS = mCmd.Execute
    
    Exit Function
  
ErrorHandler:
    ExecuteCmd = False
  
    If Err <> 0 Then
        'OLEDB/ODBC의 기본 오류 헤더(47자)를 잘라내고 핵심 SQL Server 에러 메시지만 출력
        MsgBox "[SQL Server오류] " & Mid(Err.Description, 48, 999), , "Error"
    End If
End Function

' SQL을 실행하고 그 결과를 2차원 배열로 반환
Public Function ExecCmd(ByVal sSQL As String) As Variant
    
    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        Exit Function
    End If

    '객체가 정상 반환되었는지 확인
    If mRS.State > 0 Then
        'RecordSet이 비어있는 경우 Return을 건너뜀
        If mRS.BOF = False Or mRS.EOF = False Then
            ExecCmd = mRS.GetRows
        End If
    End If

    Call CloseConnection
End Function

' SQL을 실행하고 그 결과를 Sheet의 Range 위치에 출력한다.
' 다중 RecordSet을 반환하는 경우 Range를 여러 영역으로 지정하면 대응된다.
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
    
    For iCount = 1 To xRange.Areas.Count    '다중 Range 영역 순회
        'Range의 기존 데이터 영역을 Clear한다.
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
        MsgBox "[SQL Server오류] " & Mid(Err.Description, 48, 999), , "Error"
    End If
End Function

' SQL을 실행하고 그 결과를 Sheet의 Range 위치에 출력한다.
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
    
    For iCount = 1 To xRange.Areas.Count    '다중 Range 영역 순회
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
        MsgBox "[SQL Server오류] " & Mid(Err.Description, 48, 999), , "Error"
    End If
End Function
    
' 하나의 값만 조회하여 반환
Public Function OneSelect(ByVal sGubun As String, ByVal sFindValue As String) As String
    Dim sSQL As String
   
    OneSelect = ""
    sSQL = "One_Select '" + sGubun + "', '" + sFindValue + "'"
    
    Call OpenConnection
    
    If Not ExecuteCmd(sSQL) Then
        Call CloseConnection
        Exit Function
    End If

    '객체가 정상 반환되었는지 확인
    If mRS.State > 0 Then
        If mRS.BOF = False Or mRS.EOF = False Then
            OneSelect = mRS(0).value
        End If
    End If

    Call CloseConnection
End Function

' Database에서 가져온 RecordSet 데이터를 TreeView 컨트롤에 바인딩한다.
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
        MsgBox "[SQL Server오류] " & Mid(Err.Description, 48, 999), , "Error"
    End If
End Sub

' 작업자 이름이 Database에 등록되어 있는지 검사한다.
Public Function MESUserCheck(sUserName As String) As Boolean
    Dim sSQL As String
    Dim xResult As Variant
    
    sSQL = "One_Select '작업자', '" + sUserName + "'"

    xResult = ExecCmd(sSQL)
    
    If IsEmpty(xResult) Then
        MsgBox "데이터베이스에 등록되지 않은 작업자입니다."
        MESUserCheck = False
        Exit Function
    End If
    
    MESUserCheck = True
End Function

' 현재 PC의 IP Address를 검사한다.
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

' 현재 통합문서를 바이너리 형태로 DB에 백업 저장
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
    mRS.Fields("FileName").value = sFilename
    mRS.Fields("Version").value = mRS.Fields("Version").value + 1
    mRS.Fields("Data").value = xStream.Read
    mRS.Fields("EventTime").value = DateTime.Now()
    mRS.Fields("EventUser").value = MES_Master.Range("WORKER")
    mRS.Update
    
    xStream.Close
    Call CloseConnection
    Kill "__MES_Save_Copy_File__.xlsm"
    MsgBox "통합문서가 DB에 성공적으로 저장되었습니다."
    Exit Sub
  
ErrorHandler:
    xStream.Close
    Call CloseConnection
    Kill "__MES_Save_Copy_File__.xlsm"
  
    If Err <> 0 Then
        MsgBox "[SQL Server오류] " & Mid(Err.Description, 48, 999), , "Error"
    End If
End Sub

' DB에서 최신 바이너리 파일을 다운로드
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
        MsgBox "해당 파일이 DB에 존재하지 않습니다."
        Exit Sub
    End If

    xStream.Write mRS!Data
    xStream.SaveToFile sFilename
    
    xStream.Close
    Call CloseConnection
    MsgBox "최신 버전 파일이 다운로드되었습니다."
    Exit Sub
  
ErrorHandler:
    xStream.Close
    Call CloseConnection
  
    If Err <> 0 Then
        MsgBox "[SQL Server오류] " & Mid(Err.Description, 48, 999), , "Error"
    End If
End Sub
