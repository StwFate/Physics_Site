using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;

public static class RecoveryShellLinks
{
    [ComImport, Guid("00021401-0000-0000-C000-000000000046")]
    private class ShellLinkObject { }
    [ComImport, Guid("000214F9-0000-0000-C000-000000000046"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IShellLinkW
    {
        void GetPath(StringBuilder path, int size, IntPtr data, uint flags);
        void GetIDList(out IntPtr pidl);
        void SetIDList(IntPtr pidl);
        void GetDescription(StringBuilder text, int size);
        void SetDescription([MarshalAs(UnmanagedType.LPWStr)] string text);
        void GetWorkingDirectory(StringBuilder path, int size);
        void SetWorkingDirectory([MarshalAs(UnmanagedType.LPWStr)] string path);
        void GetArguments(StringBuilder text, int size);
        void SetArguments([MarshalAs(UnmanagedType.LPWStr)] string text);
        void GetHotkey(out short key);
        void SetHotkey(short key);
        void GetShowCmd(out int command);
        void SetShowCmd(int command);
        void GetIconLocation(StringBuilder path, int size, out int index);
        void SetIconLocation([MarshalAs(UnmanagedType.LPWStr)] string path, int index);
        void SetRelativePath([MarshalAs(UnmanagedType.LPWStr)] string path, uint reserved);
        void Resolve(IntPtr window, uint flags);
        void SetPath([MarshalAs(UnmanagedType.LPWStr)] string path);
    }
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    private static extern void SHParseDisplayName(string name, IntPtr bindContext, out IntPtr pidl, uint mask, out uint attributes);

    public static void CreateAppShortcut(string destination, string appId, string description)
    {
        IntPtr pidl;
        uint attributes;
        SHParseDisplayName("shell:AppsFolder\\" + appId, IntPtr.Zero, out pidl, 0, out attributes);
        object instance = new ShellLinkObject();
        try {
            IShellLinkW link = (IShellLinkW)instance;
            link.SetIDList(pidl);
            link.SetDescription(description);
            ((IPersistFile)instance).Save(destination, true);
        } finally {
            Marshal.FreeCoTaskMem(pidl);
            Marshal.FinalReleaseComObject(instance);
        }
    }
}
