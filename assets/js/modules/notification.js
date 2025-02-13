class Notification {
  constructor(notificationList) {
    this.notificationList = notificationList ?? document.getElementById('notificationList');
  }

  // add notification to notification list
  add(notification) {
    this.notificationList.insertAdjacentElement('afterbegin', notification);
  }

  show(notification) {
    this.add(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 0);
  }

  remove(notification) {
    this.notificationList.removeChild(notification);
  }

  hide(notification, timeout, transition = 200) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => this.remove(notification), transition);
    }, timeout);
  }

  message(message, type, timeout) {
    // // skip if notification already exist
    // if (this.notificationList.innerHTML.includes(message)) return;

    // notification
    const notification = document.createElement('li');
    notification.classList.add('notification', type);
    notification.innerHTML = message;

    // // remove all notifications
    // const notifications = this.notificationList.querySelectorAll('.notification');
    // for (const notification of notifications) {
    //   this.hide(notification);
    //   setTimeout(() => this.hide(notification), 200);
    // }

    // display notification
    this.show(notification);
    this.hide(notification, timeout);

    // remove notification when double clicked
    notification.addEventListener('dblclick', () => this.hide(notification));
  }

  info(message, timeout = 2500) {
    this.message(message, 'info', timeout);
  }

  success(message, timeout = 2500) {
    this.message(message, 'success', timeout);
  }

  error(message, timeout = 2500) {
    this.message(message, 'error', timeout);
  }
}

export default Notification;
