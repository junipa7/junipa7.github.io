VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_MngDisplay"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private Const ThisModuleVersion As Integer = 1

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의


'조회 버튼이 눌러지면 실행되는이벤트
Private Sub cmdDisplay_Click()
    Dim sSQL As String
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.Management_AllSelect '" + Range("MANAGEMENT").text + "'"
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("INFO, SPEC"))
      
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.BillOfMaterial_Treeview '" + Range("MANAGEMENT").text + "'"

    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToTreeview(sSQL, treeBOM)

End Sub


