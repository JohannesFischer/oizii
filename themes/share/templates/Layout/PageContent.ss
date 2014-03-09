<section class="row">
	
	<section class="columns large-12">
		
		<h1>$Title</h1>
		
		$Text.RAW
		
	</section>
	
	<section class="columns large-12 member-list">
		
		<h3>Member</h3>
		
		<% loop getMember %>
			<div class="row">
				<div class="columns large-1 medium-4 small-6">
					<div class="user-color" style="background-color: #$Color.Hex"></div>
				</div>
				<div class="columns large-11 medium-8 small-6">
					<h4>
						<a href="/#/login">$FirstName</a>
					</h4>
					<p>$Posts.Count posts / joined $Created.Format(d/m/Y)</p>
				</div>
			</div>
		<% end_loop %>
		
	</section>
	
</section>