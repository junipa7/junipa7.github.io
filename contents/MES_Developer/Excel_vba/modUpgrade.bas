Attribute VB_Name = "modUpgrade"
Private Const ThisModuleVersion As Integer = 1

Option Explicit

'전체 모듈 소스코드를 추출하여 DB에 버전업 백업 저장
Sub UpgradeModuleSave()
    Dim xMyCom As Object 'VBComponent
    Dim sSQL As String
    Dim sType As String
    Dim sData As String

    For Each xMyCom In ThisWorkbook.VBProject.VBComponents
        If xMyCom.CodeModule.CountOfLines > 0 Then
        
            '속성 헤더를 제외한 2번째 줄부터 소스코드 추출 후 유니코드 변환
            sData = StrConv(xMyCom.CodeModule.Lines(2, xMyCom.CodeModule.CountOfLines), vbWide)
            
            If xMyCom.Type = 1 Then
                sType = "Excel_Module"
            ElseIf xMyCom.Type = 2 Then
                sType = "Excel_ClassModule"
            ElseIf xMyCom.Type = 3 Then
                sType = "Excel_From"
            ElseIf xMyCom.Type = 100 Then
                sType = "Excel_Sheet"
            End If
            
            '저장 프로시저 호출
            sSQL = "dbo.UpgradeMaster_Save '" + xMyCom.CodeModule.Name + "', '" + sType + "', '" + sData + "', '" + MES_Master.Range("WORKER").text + "'"
            Call ExecCmd(sSQL)
            
        End If
    Next
    
    MsgBox "전체 Module이 저장되었습니다."
End Sub

'DB에서 최신 소스코드를 다운로드하여 런타임 핫패치 교체
Sub UpgradeModuleLoad()
    Dim xMyCom As Object 'VBComponent
    Dim sType As String
    Dim sData As String

    For Each xMyCom In ThisWorkbook.VBProject.VBComponents
        '자기 자신(modUpgrade)은 실행 중이므로 교체 대상에서 제외하여 안전성 확보
        If xMyCom.CodeModule.Name <> "modUpgrade" Then
            
            sData = StrConv(UpgradeSelect("업그레이드", xMyCom.CodeModule.Name), vbNarrow)
            
            If Len(sData) > 1 Then
                '기존 소스코드 삭제 후 최신 코드로 교체
                xMyCom.CodeModule.DeleteLines 1, xMyCom.CodeModule.CountOfLines
                xMyCom.CodeModule.AddFromString sData
            End If
            
        End If
    Next
    
    MsgBox "전체 Module이 Loading되었습니다."
End Sub

'모듈 업데이트 전용 격리 DB 쿼리
Private Function UpgradeSelect(ByRef sGubun As String, ByRef sFindValue As String) As String
    Dim mConnection As New ADODB.Connection
    Dim mRecordSet As New ADODB.Recordset
    Dim mCommand As New ADODB.Command

    mConnection.ConnectionString = "Driver={SQL Server};Server=203.249.29.116,1433;Database=MESDB;Uid=sa1;pwd=qwer1234!;Connect Timeout=60;"
    Call mConnection.Open
    mCommand.ActiveConnection = mConnection
    
    mCommand.CommandText = "One_Select '" + sGubun + "', '" + sFindValue + "'"
    Set mRecordSet = mCommand.Execute
    
    If mRecordSet.State > 0 Then
        If mRecordSet.BOF = False Or mRecordSet.EOF = False Then
            UpgradeSelect = mRecordSet(0).value
        End If
    End If
    
    If Not mRecordSet Is Nothing Then
        If mRecordSet.State = adStateOpen Then mRecordSet.Close
    End If
    Set mRecordSet = Nothing
    
    If Not mConnection Is Nothing Then
        If mConnection.State = adStateOpen Then mConnection.Close
    End If
    Set mConnection = Nothing
    
    Set mCommand = Nothing
    
End Function

Private Function BinaryToHex(Binary)
  Dim c1, Out, OneByte

  For c1 = 1 To LenB(Binary)
    OneByte = Hex(AscB(MidB(Binary, c1, 1)))
    If Len(OneByte) = 1 Then OneByte = "0" & OneByte
    Out = Out & OneByte
  Next

  BinaryToHex = Out
End Function
