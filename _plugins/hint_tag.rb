module Jekyll
  class HintBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @style = markup.strip
      @style = 'info' if @style.empty?
    end

    def render(context)
      content = super
      "<div class=\"hint #{@style}\">#{Kramdown::Document.new(content).to_html}</div>"
    end
  end
end

Liquid::Template.register_tag('hint', Jekyll::HintBlock)
Liquid::Template.register_tag('endhint', Jekyll::HintBlock)
