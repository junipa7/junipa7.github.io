VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmMngTree 
   Caption         =   "BOM조회"
   ClientHeight    =   8070
   ClientLeft      =   120
   ClientTop       =   465
   ClientWidth     =   11205
   OleObjectBlob   =   "frmMngTree.frx":0000
   StartUpPosition =   1  '소유자 가운데
End
Attribute VB_Name = "frmMngTree"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'다른 Sheet에서 현재 Sheet를 호출할때 실행
Public Sub Worksheet_Link(sManagement As String)
    txtMng = sManagement
    Call cmdDispaly_Click
End Sub


Private Sub cmdDispaly_Click()
    Dim sSQL As String
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.BillOfMaterial_Treeview '" + txtMng.text + "'"

    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToTreeview(sSQL, trBOM)
End Sub

