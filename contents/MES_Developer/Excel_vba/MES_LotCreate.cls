Private Const ThisModuleVersion As Integer = 1

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

'다른 Sheet에서 호출할때 실행
Public Sub Worksheet_Link(PlanID As Integer)
    Range("B1").value = PlanID
    Call cmdDisplay_Click
End Sub

'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
       
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.Lot_Select " + Range("PLANID").text
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("DATA"))
    
    '조회를 다시한 경우에는 배열을 초기화하여 지정된 DELETE/SAVE 를 없앤다.
    ReDim sDataList(Range("DATA").Rows.Count)
    
    'Sheet에 조건부 서식 지정하여 Lot상태가 취소면 발간색 글자에 취소선 반영
    Call ConditionForm_Set
    
End Sub

'삭제조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDelete_Click()
    Dim sSQL As String
   
    If Range("H" & ActiveCell.Row).text = "취소" Then
        sSQL = "dbo.Lot_Delete '" + Cells(ActiveCell.Row, 1).text + "', 'UNDELETE'" + ", '" + MES_Master.Range("WORKER") + "'"
    Else
        sSQL = "dbo.Lot_Delete '" + Cells(ActiveCell.Row, 1).text + "', 'DELETE'" + ", '" + MES_Master.Range("WORKER") + "'"
    End If
    Call ExecCmd(sSQL)
    
    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
    
End Sub

'저장조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdSave_Click()
    Dim sSQL As String
    
    sSQL = "dbo.Lot_Create " + Range("PLANID").text + ", " + Range("FACTORY").text + ", " + Range("LINE").text + ", " + Range("QTY").text + ", '" + MES_Master.Range("WORKER") + "'"
    Call ExecCmd(sSQL)
    
    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
    
End Sub


'Lot연결을 누르면 Lot실적 처리로 이동한다.
Private Sub cmdLot_Click()
    
    If Cells(ActiveCell.Row, 1).value > 0 Then
        Call MES_Result.Worksheet_Link(Cells(ActiveCell.Row, 1).value)
        MES_Result.Activate
    Else
        MsgBox ("Data가 있는 셀을 먼저 선택하고 버튼을 누르세요")
    End If
End Sub


'Sheet에 조건부 서식을 적용하여 LOT상태가 취소이면 취소선과 빨간색 글자를 표시한다.
Private Sub ConditionForm_Set()

    With Range("DATA")
        .FormatConditions.Delete
        .FormatConditions.Add Type:=xlExpression, Formula1:="=IF($H5 = ""취소"",TRUE,FALSE)"
        .FormatConditions(.FormatConditions.Count).SetFirstPriority
        .FormatConditions(1).Font.Strikethrough = True
        .FormatConditions(1).Font.Color = -16776961
        .FormatConditions(1).Font.TintAndShade = 0
        .FormatConditions(1).StopIfTrue = False
    End With

End Sub


