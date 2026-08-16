Attribute VB_Name = "modRibbonMenu"
Private Const ThisModuleVersion As Integer = 2

Option Explicit   '변수가 지정되지 않으면 에러가 나도록 정의

'Callback for customButton1 onAction
'Ribbon Menu편집기 사이트 연결
Sub conRibbonXEditorHttpSub(control As IRibbonControl)
'    Dim xlApp As Object
'
'    Set xlApp = CreateObject("InternetExplorer.Application")
'
'    xlApp.Navigate "https://github.com/fernandreu/office-ribbonx-editor"
'
'    Do
'        DoEvents
'    Loop While xlApp.Busy
'
'    xlApp.Visible = True
'    Set xlApp = Nothing
    
    ActiveWorkbook.FollowHyperlink "https://github.com/fernandreu/office-ribbonx-editor"
    
End Sub

'Callback for customButton2 onAction
'기준정보 Sheet의 작업자를 수정하러 이동
Sub conWorkerChangeSub(control As IRibbonControl)
    MES_Master.Activate
    MES_Master.Range("WORKER").Select
End Sub

'Callback for customButton3 onAction
'기준정보 Sheet의 서버를 수정하러 이동
Sub conSQLServerChangeSub(control As IRibbonControl)
    MES_Master.Activate
    Range("SERVER").Select
End Sub


'Callback for customButton3 onAction
'공정Master Sheet를 공정정보 Sheet로 복사
Sub conMES_Product_Process(control As IRibbonControl)
    
'    If FindSheetName("공정Master") Then
'        MsgBox "공정정보 Sheet가 이미 있습니다."
'        Exit Sub
'    End If
'
'    MES_Process.Copy after:=Worksheets(Worksheets.Count)
'
'    ActiveSheet.Name = "공정Master"
    
    Call Create_MES_Product_Process
End Sub




'Callback for MES_UserInfo getText
Sub MES_Master_User_getText(control As IRibbonControl, ByRef returnedVal)

    returnedVal = MES_Master.Range("WORKER").text
    
    'Application.CommandBars.ExecuteMso
'ExecuteMso  컨트롤을 실행합니다.
'GetEnabledMso   컨트롤이 사용 가능한 상태이면 True 값을 돌려줍니다.
'GetImageMso 컨트롤의 이미지를 알려줍니다.
'GetLabelMso 컨트롤의 레이블을 알려줍니다.
'GetPressedMso   해당 컨트롤이 눌려졌으면 True 값을 돌려줍니다.
'GetScreentipMso 해당 컨트롤의 스크린 팁 도움말을 표시합니다.
'GetSupertipMso  해당 컨트롤에 대한 자세한 설명을 표시합니다.
'Application.CommandBars.ExecuteMso ("ChartTypeAllInsertDialog")
'
'Application.CommandBars.ExecuteMso ("ChartTypeAllInsertDialog")
'
'다음 코드를 실행하면 '선택하여 붙여넣기' 컨트롤에 대한 풍선 형태의 도움말이 표시됩니다.
'
'MsgBox Application.CommandBars.GetScreentipMso("PasteSpecialDialog")
'
'특정 컨트롤에 대한 자세한 설명을 보려면 GetSupertipMso 메서드를 사용합니다. '붙여넣기' 컨트롤에 대한 자세한 설명을 보려면 이렇게 하면 됩니다.
'
'MsgBox Application.CommandBars.GetSupertipMso("PasteMenu")

End Sub

'Callback for MES_UserInfo onChange
'작업자를 변경하면 데이타베이스에 있는지 확인
Sub MES_Master_User_Change(control As IRibbonControl, text As String)
        MES_Master.Range("WORKER").value = text
End Sub

'Callback for MES_ServerInfo onChange
'서버를 변경하면 기준정보 Sheet에도 자동 반영
Sub MES_Master_Server(control As IRibbonControl, text As String)
    Range("SERVER").value = text
End Sub

Sub MES_Master_Server_getText(control As IRibbonControl, ByRef returnedVal)
    returnedVal = Range("SERVER").text
End Sub


'Callback for MES_ExcelSave onAction
Sub MES_ProgramSave(control As IRibbonControl)
    Call UpgradeModuleSave
End Sub

'Callback for MES_ExcelLoad onAction
Sub MES_ProgramLoad(control As IRibbonControl)
    Call UpgradeModuleLoad
End Sub

'Sheet이름이 있는지를 찻아오는 함수
Private Function FindSheetName(sSheetName As String) As Boolean
    Dim xSheet As Worksheet
    
    On Error GoTo ExitLab
    For Each xSheet In ActiveWorkbook.Sheets
        If xSheet.Name = sSheetName Then
            FindSheetName = True
            Exit Function
        End If
        
ExitLab:
    Next
    
    FindSheetName = False
End Function
