VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_Warehousing"
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
        Call RangeCode_Set(Range("WHEREHOUSE"), "전체," + CodeList_Select("WhereHouse.WhereHouse"))
        Call RangeCode_Set(Range("MATERIAL"), CodeList_Select("Material.Material"))
        
        bInitflag = True
    End If
End Sub

'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
    
    'Lot가 존재하지 않으면 중지
    Range("WHEREHOUSE").Offset(0, 1).value = OneSelect("창고명", Range("WHEREHOUSE").text)

    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.MaterialInventory_Select '" + Range("WHEREHOUSE").text + "'"
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToSheet(sSQL, Range("DATA"))
    
'    Range("MATERIAL") = ""
'    Range("QTY") = ""
    
End Sub

'저장조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdSave_Click()
    Dim sSQL As String

    If Range("WHEREHOUSE").text = "전체" Then
        MsgBox "자재입고는 원자재 창고에만 실행할수 있습니다."
        Exit Sub
    End If
    
    If Range("MATERIAL").text = "전체" Then
         MsgBox "자재를 선택한후 실행하십시요."
        Exit Sub
    End If

    If Range("QTY").value < 1 Then
        MsgBox "입고수량을 입력한후 실행하십시요."
        Exit Sub
    End If
    
    sSQL = "dbo.MaterialInventory_Create '" + Range("WHEREHOUSE").text + "', '" + Range("MATERIAL").text + "', '정상', " + Range("QTY").text + ", '" + MES_Master.Range("WORKER") + "'"
    Call ExecCmd(sSQL)
    
    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click
    
End Sub

Private Sub cmdMove_Click()
    Dim sSQL As String
    
    If Range("WHEREHOUSE").text = "전체" Then
        MsgBox "자재이동은 현장 창고에만 실행할수 있습니다."
        Exit Sub
    End If
    
    If Range("MATERIAL").text = "전체" Then
         MsgBox "자재를 선택한후 실행하십시요."
        Exit Sub
    End If

    If Range("QTY").value < 1 Then
        MsgBox "입고수량을 입력한후 실행하십시요."
        Exit Sub
    End If
    
    sSQL = "dbo.MaterialMove_Moving2 '" + Range("MATERIAL").text + "', " + Range("QTY").text + ", '" + Range("WHEREHOUSE").text + "', '정상', '" + MES_Master.Range("WORKER") + "'"
    Call ExecCmd(sSQL)
    
    '조회 Button을 강제로 눌러서 다시조회
    Call cmdDisplay_Click


End Sub
