VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_Inspection"
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
    sSQL = "dbo.SpecResult_Select '" + Range("LOTID").text + "'"
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("DATA_HEAD, DATA"))
    
    'Data가 1건만 있을때 End(xlDown)을 사용하면 최대행까지 선택이 되어 속도가 느려짐
    Call ComboSetup(Range("DATA"), 9, 10)

End Sub


Private Sub cmdSave_Click()
    Dim sSQL As String
    Dim sSpecInfo As String
    
    If Range("LOTSTATUS").value <> "진행" Then
        MsgBox "LOT가 진행중이 아니면 검사실적 처리를 할수 없습니다."
        Exit Sub
    End If
    
    '측정값을 하나의 문자열로 변환
    sSpecInfo = RangeToString(Range("DATA"), 3, 10, 11)

    'Data를 저장하기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.SpecResult_Save '" & Range("LOTID").text & "', " & Range("SEQ").value & ", '" & sSpecInfo & "', '" & MES_Master.Range("WORKER") & "'"

    Call ExecCmd(sSQL)
   
    '저장이 완료되면 생산실적 입력으로 강제이동
    Call cmdLink_Click
End Sub

'Cell에서 Data수정이 발생하면 실행되는 Event
Private Sub Worksheet_Change(ByVal Target As Range)

    'Worksheet_Activate가 실행이 안되었거나 Sheet에 Data를 뿌리는 중이면 바로 빠져나감.
    If Not Application.ScreenUpdating Then
        Exit Sub
    End If

    '사양코드가 있는 행의 변경인지 확인
    If Cells(Target.Row, Range("DATA").Column) <> "" Then
        'Data수정이 측정값 열인지 확인하여 정상입력이면 자동판정
        If Target.Column = Range("INPUT").Column Then
            '수정에 의한 무한 루프를 방지 한다
            Application.ScreenUpdating = False
            
            '콤보냐 아니냐에 따라 판정기준이 다름
            If Target.Offset(0, -5).text = "선택" Then
                Target.Offset(0, 1).FormulaR1C1 = "=IF(RC[-1]=RC[-5],""OK"",""NG"")"
            Else
                Target.Offset(0, 1).FormulaR1C1 = "=IF(OR(RC[-1]<RC[-4],RC[-1]>RC[-3]),""NG"",""OK"")"
            End If
            
            Target.Offset(0, 2).value = DateTime.Now()
            Target.Offset(0, 3).value = MES_Master.Range("WORKER")
        
            Application.ScreenUpdating = False
        
        End If
    End If

End Sub




