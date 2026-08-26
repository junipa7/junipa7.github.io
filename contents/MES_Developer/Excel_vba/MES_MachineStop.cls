Private Const ThisModuleVersion As Integer = 2

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

Private bInitflag As Boolean  'Worksheet_Activate 실행여부를 저장

'다른 Sheet에서 호출할때 실행
Public Sub Worksheet_Link(sParameter As String)
    Range("MACHINE").value = sParameter
    Call cmdDisplay_Click
End Sub

'실행전 초기화 해야할 변수
Private Sub Worksheet_Activate()
    Static bInitflag As Boolean
    
    If bInitflag = False Then
         '배열변수의 크기를 재조정
        ReDim sDataList(Range("DATA").Rows.Count)
        
        '코드정보를 Sheet에 몰록형태로 입력제약을 걸어준다.
        Call RangeCode_Set(Range("MACHINE"), CodeList_Select("Machine.Machine"))
        Call RangeCode_Set(Range("STOPCODE"), CodeList_Select("Machine.StopCode"))
        
        bInitflag = True
    End If
End Sub

'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
    
    '설비가 존재하지 않으면 중지
    Range("MACHINE").Offset(0, 1).value = OneSelect("설비명", Range("MACHINE").text)
    If Range("MACHINE").Offset(0, 1).text = "" Then
        Exit Sub
    End If
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.MachineStop_Select '" + Range("MACHINE").text + "'"
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("DATA_HEAD, DATA"))
    
End Sub

'설비를 신규로 중지시킨다.
Private Sub cmdStop_Click()
    Dim sSQL As String
    Dim sAlarm As String
    Dim sReason As String
    
    'Lot상태 체크
    If Range("STATUS").value = "STOP" Then
        MsgBox "설비가 이미 중지상태라 중지 처리를 할수 없습니다."
        Exit Sub
    End If

    'Alarm 체크
    If Range("STOPCODE").text = "" Then
        MsgBox "중지를 지정하려면 먼저 중지종류을 선택해야 합니다."
        Exit Sub
    End If
    
    sReason = InputBox("중지사유를 입역하세요")
    If Len(sReason) < 5 Then
        MsgBox "중지사유는 5글자 이상 입력해야 합니다."
        Exit Sub
    End If
    
    'Data를 저장하기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.MachineStop_Stop '" & Range("MACHINE").text & "', '" & Range("STOPCODE").text & "', '" & sReason & "', '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)

    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
End Sub

'Lot중지를 해제시킨다.
Private Sub cmdRelease_Click()
    Dim sSQL As String
    Dim sReason As String
    Dim sStopCode As String
    
    If Range("STATUS").value <> "STOP" Then
        MsgBox "설비가 중지중이 아니면 해제 처리를 할수 없습니다."
        Exit Sub
    End If
    
    If Range("DATA").Cells(2, 1) = "" Then
        sStopCode = Range("DATA").Cells(1, 1).text
    Else
        sStopCode = Range("DATA").Cells(1, 1).End(xlDown).text
    End If
    
    sReason = InputBox("해제사유를 입역하세요")
    If Len(sReason) < 5 Then
        MsgBox "해제사유는 5글자 이상 입력해야 합니다."
        Exit Sub
    End If

    'Data를 저장하기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.MachineStop_Release '" & sStopCode & "', '" & sReason & "', '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)

    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
End Sub



