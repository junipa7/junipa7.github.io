VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "MES_Master"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Private Const ThisModuleVersion As Integer = 4

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

Private sSourceName As String
Private sSourceType As String
Private iHistoryID As Integer

Private Sub cmdDisplay_Click()
    Dim sSQL As String
    
    'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
    sSQL = "dbo.UpgradeMaster_Select '%', '%'"
    
    '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
    Call SelectToRange(sSQL, Range("LIST"))
    
    '콘트롤 초기화
    Range("VERSION").CurrentRegion.Offset(1, 0).ClearContents
    txtSource.value = ""
    cmdSave.Enabled = False
    
    '변수초기화
    sSourceName = ""
    sSourceType = ""
    iHistoryID = 0
End Sub


Private Sub cmdSave_Click()

    Dim sSQL As String
    
    'Data를 저장하기 위한 저장 프로시져 호출 Query를 만든다.
    'sSQL = "dbo.UpgradeMaster_Save '" & sSourceName & "', '" & sSourceType & "', '" & StrConv(txtSource.text, vbWide) & "', '" & MES_Master.Range("WORKER").text & "'"
    sSQL = "dbo.UpgradeHistory_Update " & iHistoryID & ", '" & StrConv(txtSource.text, vbWide) & "', '" & MES_Master.Range("WORKER").text & "'"
    Call ExecCmd(sSQL)
    
    Call cmdDisplay_Click
                
End Sub


Private Sub Worksheet_Change(ByVal Target As Range)
    If Target.Address = MES_Master.Range("WORKER").Address Then
        If MESUserCheck(Target.text) Then

        End If
    End If
End Sub


Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    Dim sSQL As String
    
    If Target.text <> "" Then
        If Target.Column = Range("LIST").Column And Target.Row > Range("LIST").Row Then
        
            sSourceName = Target.text
            sSourceType = Target.Offset(0, 1).text
            
            'Data를 가져오기 위한 저장 프로시져 호출 Query를 만든다.
            sSQL = "dbo.UpgradeHistory_Select " & Target.Offset(0, 2).text
            
           '저장 프로시져를 호출하고 결과를 Excel Sheet에 출력한다.
            Call SelectToSheet(sSQL, Range("VERSION"))
            
            If Target.Offset(0, 1).text = "Query" Then
                cmdSave.Enabled = True
            Else
                cmdSave.Enabled = False
            End If
            
        ElseIf Target.Column = Range("VERSION").Column Then
        
            iHistoryID = Target.Offset(0, 1).value
            txtSource.value = StrConv(OneSelect("업그래이드이력조회", iHistoryID), vbNarrow)
           
        End If
    
    End If

End Sub
