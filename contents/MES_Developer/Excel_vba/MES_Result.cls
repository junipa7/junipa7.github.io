VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_Result"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private Const ThisModuleVersion As Integer = 2

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

'다른 Sheet에서 호출할때 실행
Public Sub Worksheet_Link(LotID As String)
    Range("LOTID").value = LotID
    Call cmdDisplay_Click
End Sub

'검사실적 처리로 이동한다.
Private Sub cmdLink_Click()
    If Range("LOTID") > "" Then
        Call MES_Inspection.Worksheet_Link(Range("LOTID").value)
        MES_Inspection.Activate
    Else
        MsgBox ("LOT ID가 없습니다.")
    End If
End Sub

'LOT 중지해제 처리로 이동한다.
Private Sub cmdStopLink_Click()
    If Range("LOTID") > "" Then
        Call MES_LotStop.Worksheet_Link(Range("LOTID").value)
        MES_LotStop.Activate
    Else
        MsgBox ("LOT ID가 없습니다.")
    End If
End Sub

'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
    Dim xResult As Variant
       
    'Lot가 존재하지 않으면 중지
    Range("LOTID").Offset(0, 1).value = OneSelect("로트번호", Range("LOTID").text)
    If Range("LOTID").Offset(0, 1).text = "" Then
        Exit Sub
    End If
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.Lot_Info_Select '" + Range("LOTID").text + "'"
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("DATA_HEAD, DATA_DEFECT, DATA"))

    '현재공정에 해당하는 설비리스트 설정
    Call RangeCode_Set(Range("MACHINE"), CodeList_Select("Machine.Process", Range("PROCESS").text), True)

'    '조회 결과 검사공정인대 아직 검사실적 입력이 안되어 있으면 검사실적 입력으로 강제이동
'    If Range("D14").text = "ER" Then
'        Call cmdLink_Click
'    End If
End Sub

'공정실적을 완료처리한다.
Private Sub cmdFinish_Click()
    Dim sSQL As String
    Dim sDefect As String
    Dim iQty As Long
    
    '검사실적 입력이 안되어 있으면 검사실적입력 Sheet로 이동한다.
    If Range("INSPECTION").value = "ER" Then
        Call cmdLink_Click
        Exit Sub
    End If
    
    '검사실적 입력 결과가 불합격인경우 재작업으로 진행할것인지 확인 받는다.
    If Range("INSPECTION").value = "NG" Then
        iQty = MsgBox("검사 실적이 불합격이기 때문에 재작업 프로세스로 진행하시겠습니까?.", vbOKCancel, "불합격")
        If iQty = vbCancel Then
            Exit Sub
        End If
    End If
    
    If Range("LOTSTATUS").value <> "진행" And Range("LOTSTATUS").value <> "생성" Then
        MsgBox "LOT가 정상 진행상태가 아니면 실적처리할수 없습니다."
        Exit Sub
    End If
    
    '총불량수량을 합산한다.
    iQty = Application.WorksheetFunction.Sum(Range("DATA_DEFECT").Columns(4))
    
    '불량정보를 하나의 문자열로 변환
    sDefect = RangeToString(Range("DATA_DEFECT"), 2, 4)

    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.Lot_Process_Run '" & Range("LOTID").text & "', " & Range("ROUTINGNO").value & ", '" & Range("MACHINE").text & "', " & iQty & ",'" & sDefect & "', '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)

    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
End Sub

Private Sub cmdCancle_Click()
    Dim sSQL As String
  
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.Lot_Process_Cancel '" & Range("LOTID").text & "', " & Range("SEQ").text & ", '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)

    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
End Sub


'콤보의 첫번째 문자열을 반환.
Private Function ComboFirst(sComboString As String) As String
    Dim i As Integer
    
    i = InStr(sComboString, ",")
    
    If i = 0 Then
        ComboFirst = sComboString
    Else
        ComboFirst = Left(sComboString, i - 1)
    End If
End Function

