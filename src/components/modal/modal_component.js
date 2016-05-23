import { Component } from "../../core/bane";
import track from "../../core/decorators/track";
import waitForTimeout from "../../core/utils/waitForTransition";
import Overlay from "../overlay";
import matchMedia from "../../core/utils/matchMedia";
import breakpoints from "../../core/utils/breakpoints";

class Modal extends Component {
  initialize(options) {
    this.events = {
      "touchend a": "goTo"
    };

    this.$html = $("html");
    this.$body = $("body");
    this.$strapline = $(".ebook__strapline");
    this.$title = $(".ebook__title");
    this.$copy = $(".ebook__copy");
    this.$form = $(".js-sailthru-form");
    this.$success = $(".js-success");

    // Remove from dom
    this.$el.detach();

    // New overlay instance
    this.overlay = new Overlay();

    // Events
    this.$body.on("click", ".js-modal", this.show.bind(this));
    this.$body.on("keyup", this.onKeyup.bind(this));
    this.$el.on("click", "[class*='__close']", this.hide.bind(this));
    this.$el.on("submit", ".js-sailthru-form", this.submit.bind(this));
    this.listenTo(this.overlay, "click", this.hide);

    //fire modal on correct url hash

    if (options.hash === location.hash) {
      $(".js-modal").trigger("click");
    }
  }

  /**
   * Handle touch events on top places
   * @param  {[Event]} e
   */
  goTo(e) {
    let el = $(e.currentTarget),
        link = el.attr("href");

    window.location = link;
  }

  toggle() {
    if(this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }
  @track("Modal Open").sendReturnValue(false)
  show() {
    if(this.isOpen) {
      return Promise.all([]);
    }
    if(this.$el.parent().length === 0) {
      this.$el.appendTo(document.body);
    }

    this.overlay.show();

    matchMedia(`(max-width: ${breakpoints.max["720"]})`, (query) => {
      console.log("matchmedia", query);
      if (query.matches) {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        console.log("scroll");
      }
    });

    // wait a few ticks so transition triggers
    setTimeout(() => {
      this.$el.addClass("modal--visible");
    }, 10);

    this.isOpen = true;
  }
  @track("Modal Close").sendReturnValue(false)
  hide() {
    if(!this.isOpen) {
      return Promise.all([]);
    }

    this.isOpen = false;

    this.overlay.hide();

    this.$el.removeClass("modal--visible");

    waitForTimeout(this.$el)
      .then(() => {
        this.$el.detach();
      });
  }

  onKeyup(e) {
    // ESC
    if(e.keyCode === 27 && this.isOpen) {
      this.hide();
    }
  }

  handleSubmitSuccess() {
    this.$form.addClass("is-hidden");
    this.$strapline.addClass("is-hidden");
    this.$title.addClass("is-hidden");
    this.$copy.addClass("is-hidden");
    this.$success.removeClass("is-hidden");
  }

  submit(e) {
    e.preventDefault();
    $.post(this.$form.attr("action"), this.$form.serialize())
      .done(() => {
        this.handleSubmitSuccess();
      })
      .fail((xhr) => {
        if (xhr.status === 409) {
          this.handleSubmitSuccess();
        } else {
          console.log("error");
        }
      });
  }
}

export default Modal;
