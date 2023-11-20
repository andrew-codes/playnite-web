// using System.Text.RegularExpressions;
// using System.Windows;
// using System.Windows.Controls;
// using System.Windows.Input;

// namespace PlayniteWebPlugin.UI
// {
//   public partial class MQTTClientSettingsView : UserControl
//   {
//     public MQTTClientSettingsView()
//     {
//       InitializeComponent();
//     }

//     private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
//     {
//       var regex = new Regex("[^0-9]+");
//       e.Handled = regex.IsMatch(e.Text);
//     }

//     private void PasswordBox_OnPasswordChanged(object sender, RoutedEventArgs e)
//     {
//       var context = (MQTTClientSettingsView)DataContext;
//       context.SavePassword(PasswordBox.Password);
//     }
//   }
// }
