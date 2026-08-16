VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_LotStop"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private Const ThisModuleVersion As Integer = 2

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

'실행전 초기화 해야할 변수
Private Sub Worksheet_Activate()
    Static bInitflag As Boolean
    
    If bInitflag = False Then
         '배열변수의 크기를 재조정
        ReDim sDataList(Range("DATA").Rows.Count)
        
        '코드정보를 Sheet에 몰록형태로 입력제약을 걸어준다.
        Call RangeCode_Set(Range("ALARM"), CodeList_Select("Ararm.Ararm"))
        
        bInitflag = True
    End If
End Sub

'다른 Sheet에서 호출할때 실행
Public Sub Worksheet_Link(LotID As String)
    Range("LOTID").value = LotID
    Call cmdDisplay_Click
End Sub

'생산실적 처리로 이동한다.
Private Sub cmdLink_Click()
    If Range("LOTID") > "" Then
        Call MES_Result.Worksheet_Link(Range("LOTID").value)
        MES_Result.Activate
    Else
        MsgBox ("LOT ID가 없습니다.")
    End If
End Sub


'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
     
    'Lot가 존재하지 않으면 중지
    Range("LOTID").Offset(0, 1).value = OneSelect("로트번호", Range("LOTID").text)
    If Range("LOTID").Offset(0, 1).text = "" Then
        Exit Sub
    End If
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.LotStop_Select '" + Range("LOTID").text + "'"
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("DATA_HEAD, DATA"))
    
    'Range("ALARM") = ""

End Sub

'Lot를 신규로 중지시킨다.
Private Sub cmdStop_Click()
    Dim sSQL As String
    Dim sAlarm As String
    Dim sReason As String

    'Lot상태 체크
    If Range("LOTSTATUS").value <> "진행" Then
        MsgBox "LOT가 진행중이 아니면 중지 처리를 할수 없습니다."
        Exit Sub
    End If

    'Alarm 체크
    If Range("ALARM").text = "" Then
        MsgBox "중지를 지정하려면 먼저 Alarm을 선택해야 합니다."
        Exit Sub
    End If
    
    sReason = InputBox("중지사유를 입역하세요")
    If Len(sReason) < 5 Then
        MsgBox "중지사유는 5글자 이상 입력해야 합니다."
        Exit Sub
    End If
    
    'Data를 저장하기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.LotStop_Stop '" & Range("LOTID").text & "', " & Range("SEQ").value & ", " & Range("ALARM").text & ", '" & sReason & "', '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)

    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
End Sub

'Lot중지를 해제시킨다.
Private Sub cmdRelease_Click()
    Dim sSQL As String
    Dim sReason As String
    Dim sStopCode As String

    If Range("LOTSTATUS").value <> "중지" Then
        MsgBox "LOT가 중지중이 아니면 해제 처리를 할수 없습니다."
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
    sSQL = "dbo.LotStop_Release '" & sStopCode & "', '" & sReason & "', '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)

    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
End Sub


Private Sub Worksheet_Change(ByVal Target As Range)
    If Target.Address = Range("ALARM").Address Then
        Range("ALARM").Offset(0, 1).value = OneSelect("알람명", Range("ALARM").text)
    End If
End Sub


